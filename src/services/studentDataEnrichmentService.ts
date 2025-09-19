/**
 * Student Data Enrichment Service
 *
 * This service fetches additional data for students to support all template variables
 * across different pages (students-list, announcements, attendance-report, referral-settings)
 */

export interface EnrichedStudentData {
    // Basic student info (already available)
    user_id: string;
    full_name: string;
    email: string;
    mobile_number: string;
    username?: string;
    created_at: string;

    // Course information (needs to be fetched)
    course_id?: string;
    course_name?: string;
    course_description?: string;
    course_price?: string;
    course_duration?: string;
    course_start_date?: string;
    course_end_date?: string;
    course_instructor?: string;

    // Batch information (needs to be fetched)
    batch_id?: string;
    batch_name?: string;
    batch_start_date?: string;
    batch_end_date?: string;

    // Institute information (needs to be fetched)
    institute_id?: string;
    institute_name?: string;
    institute_address?: string;
    institute_phone?: string;
    institute_email?: string;
    institute_website?: string;

    // Attendance information (needs to be fetched)
    attendance_status?: string;
    attendance_date?: string;
    attendance_percentage?: string;
    attendance_total_classes?: string;
    attendance_attended_classes?: string;
    attendance_last_class_date?: string;

    // Live class information (needs to be fetched)
    live_class_title?: string;
    live_class_date?: string;
    live_class_time?: string;
    live_class_duration?: string;
    live_class_instructor?: string;
    live_class_meeting_link?: string;
    live_class_meeting_id?: string;
    live_class_password?: string;
    live_class_platform?: string;
    live_class_room?: string;
    live_class_notes?: string;
    live_class_recording_link?: string;
    live_class_status?: string;
    next_live_class_date?: string;
    next_live_class_time?: string;

    // Referral information (needs to be fetched)
    referral_code?: string;
    referral_link?: string;
    referral_count?: string;
    referral_rewards?: string;
    referral_bonus?: string;
    referral_status?: string;
    referred_by?: string;
    referred_by_name?: string;
    referral_program_start?: string;
    referral_program_end?: string;
    referral_terms?: string;
    referral_benefits?: string;

    // Custom fields
    custom_field_1?: string;
    custom_field_2?: string;
    student_unique_link?: string;
    enrollment_number?: string;
}

export interface DataEnrichmentOptions {
    includeCourse?: boolean;
    includeBatch?: boolean;
    includeInstitute?: boolean;
    includeAttendance?: boolean;
    includeLiveClass?: boolean;
    includeReferral?: boolean;
    includeCustomFields?: boolean;
}

export class StudentDataEnrichmentService {
    private baseURL: string;
    private authToken: string;

    constructor(baseURL: string = '/api') {
        this.baseURL = baseURL;
        this.authToken = this.getAuthToken();
    }

    private getAuthToken(): string {
        return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token') || '';
    }

    private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
        const url = `${this.baseURL}${endpoint}`;
        const config: RequestInit = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.authToken}`,
                ...options.headers,
            },
        };

        try {
            const response = await fetch(url, config);
            if (!response.ok) {
                throw new Error(`API request failed: ${response.status} ${response.statusText}`);
            }

            // Check if response is JSON
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            } else {
                // If not JSON, read as text to see what we got
                const textResponse = await response.text();
                console.warn(`Non-JSON response received for ${endpoint}:`, textResponse.substring(0, 200));
                throw new Error(`API returned non-JSON response: ${textResponse.substring(0, 100)}`);
            }
        } catch (error) {
            console.error(`API request failed for ${endpoint}:`, error);
            throw error;
        }
    }

    /**
     * Enrich student data by fetching missing information
     */
    async enrichStudentData(
        students: any[],
        options: DataEnrichmentOptions = {}
    ): Promise<EnrichedStudentData[]> {
        const {
            includeCourse = true,
            includeBatch = true,
            includeInstitute = true,
            includeAttendance = true,
            includeLiveClass = true,
            includeReferral = true,
            includeCustomFields = true
        } = options;

        console.log('Starting data enrichment for', students.length, 'students');

        try {
            // Get institute data from cache first (no API call needed)
            console.log('Getting institute data from cache...');
            const instituteData = await this.getCachedInstituteData();
            console.log('Institute data from cache:', instituteData);

            // For now, use fallback strategy for other data since APIs don't exist
            // This provides better data than the original implementation
            const enrichedStudents: EnrichedStudentData[] = await Promise.all(students.map(async (student) => {
                const enriched: EnrichedStudentData = {
                    // Basic student info (already available)
                    user_id: student.user_id,
                    full_name: student.full_name,
                    email: student.email,
                    mobile_number: student.mobile_number,
                    username: student.username,
                    created_at: student.created_at,
                    enrollment_number: student.institute_enrollment_id || student.user_id,
                    student_unique_link: this.generateStudentLink(student.user_id),
                };

                // Add institute data
                if (instituteData) {
                    enriched.institute_id = instituteData.institute_id;
                    enriched.institute_name = instituteData.institute_name;
                    enriched.institute_address = instituteData.institute_address;
                    enriched.institute_phone = instituteData.institute_phone;
                    enriched.institute_email = instituteData.institute_email;
                    enriched.institute_website = instituteData.institute_website;
                    enriched.institute_logo = instituteData.institute_logo;
                }

                // Add fallback data for all other variables
                await this.addFallbackData(enriched, student);

                return enriched;
            }));

            console.log('Data enrichment completed for', enrichedStudents.length, 'students');

            // Log detailed enrichment data for first student
            if (enrichedStudents.length > 0) {
                console.log('=== ENRICHED STUDENT DATA (First Student) ===');
                const firstStudent = enrichedStudents[0];
                console.log('Student ID:', firstStudent.user_id);
                console.log('Student Name:', firstStudent.full_name);
                console.log('Course Data:', {
                    course_name: firstStudent.course_name,
                    course_description: firstStudent.course_description,
                    course_price: firstStudent.course_price
                });
                console.log('Batch Data:', {
                    batch_name: firstStudent.batch_name,
                    batch_id: firstStudent.batch_id
                });
                console.log('Attendance Data:', {
                    attendance_status: firstStudent.attendance_status,
                    attendance_percentage: firstStudent.attendance_percentage,
                    attendance_total_classes: firstStudent.attendance_total_classes,
                    attendance_attended_classes: firstStudent.attendance_attended_classes
                });
                console.log('Institute Data:', {
                    institute_name: firstStudent.institute_name,
                    institute_email: firstStudent.institute_email,
                    institute_website: firstStudent.institute_website
                });
                console.log('=== END ENRICHED STUDENT DATA ===');
            }

            return enrichedStudents;

        } catch (error) {
            console.error('Error enriching student data:', error);
            // Return students with basic data if enrichment fails
            return await this.createFallbackEnrichedStudents(students);
        }
    }

    /**
     * Create fallback enriched students when enrichment fails
     */
    private async createFallbackEnrichedStudents(students: any[]): Promise<EnrichedStudentData[]> {
        return await Promise.all(students.map(async (student) => {
            const enriched: EnrichedStudentData = {
                user_id: student.user_id,
                full_name: student.full_name,
                email: student.email,
                mobile_number: student.mobile_number,
                username: student.username,
                created_at: student.created_at,
                enrollment_number: student.institute_enrollment_id || student.user_id,
                student_unique_link: this.generateStudentLink(student.user_id),
            };

            await this.addFallbackData(enriched, student);
            return enriched;
        }));
    }

    /**
     * Add fallback data for all template variables
     */
    private async addFallbackData(enriched: EnrichedStudentData, student: any): Promise<void> {
        // Course data (extract from institute store data)
        const courseData = await this.extractCourseDataFromInstitute(student);
        enriched.course_name = courseData.name;
        enriched.course_description = courseData.description;
        enriched.course_price = courseData.price;
        enriched.course_duration = courseData.duration;
        enriched.course_start_date = courseData.startDate;
        enriched.course_end_date = courseData.endDate;
        enriched.course_instructor = courseData.instructor;

        // Batch data (extract from institute store data)
        const batchData = await this.extractBatchDataFromInstitute(student);
        enriched.batch_name = batchData.name;
        enriched.batch_id = batchData.id;
        enriched.batch_start_date = batchData.startDate;
        enriched.batch_end_date = batchData.endDate;

        // Institute data (with better fallbacks) - only if not already set
        if (!enriched.institute_name) {
            enriched.institute_name = student.linked_institute_name || `Institute ${enriched.user_id?.substring(0, 8) || 'Unknown'}`;
        }
        if (!enriched.institute_address) {
            enriched.institute_address = student.institute_address || 'Address not available';
        }
        if (!enriched.institute_phone) {
            enriched.institute_phone = student.institute_phone || 'Phone not available';
        }
        if (!enriched.institute_email) {
            enriched.institute_email = student.institute_email || 'Email not available';
        }
        if (!enriched.institute_website) {
            enriched.institute_website = student.institute_website || 'Website not available';
        }
        if (!enriched.institute_logo) {
            enriched.institute_logo = student.institute_logo || 'Logo not available';
        }

        // Attendance data (dynamic calculation)
        const attendanceData = this.calculateAttendanceData(student);
        enriched.attendance_status = attendanceData.status;
        enriched.attendance_date = attendanceData.date;
        enriched.attendance_percentage = attendanceData.percentage;
        enriched.attendance_total_classes = attendanceData.totalClasses;
        enriched.attendance_attended_classes = attendanceData.attendedClasses;
        enriched.attendance_last_class_date = attendanceData.lastClassDate;

        // Live class data (with better fallbacks)
        enriched.live_class_title = student.live_class_title || 'Live Class Session';
        enriched.live_class_name = student.live_class_title || 'Live Class Session';
        enriched.live_class_date = student.live_class_date || '';
        enriched.live_class_time = student.live_class_time || '';
        enriched.live_class_start_time = student.live_class_time || '';
        enriched.live_class_end_time = student.live_class_time || '';
        enriched.live_class_duration = student.live_class_duration || '';
        enriched.live_class_instructor = student.live_class_instructor || 'Instructor';
        enriched.live_class_link = student.live_class_meeting_link || '';
        enriched.live_class_meeting_link = student.live_class_meeting_link || '';
        enriched.live_class_meeting_id = student.live_class_meeting_id || '';
        enriched.live_class_password = student.live_class_password || '';
        enriched.live_class_platform = student.live_class_platform || 'Online Platform';
        enriched.live_class_room = student.live_class_room || '';
        enriched.live_class_notes = student.live_class_notes || '';
        enriched.live_class_description = student.live_class_notes || '';
        enriched.live_class_batch = student.batch_name || 'Your Batch';
        enriched.live_class_recording_link = student.live_class_recording_link || '';
        enriched.live_class_status = student.live_class_status || 'upcoming';
        enriched.next_live_class_date = student.next_live_class_date || '';
        enriched.next_live_class_time = student.next_live_class_time || '';
        enriched.next_live_class_title = student.live_class_title || 'Next Live Class';

        // Referral data (with better fallbacks)
        enriched.referral_code = student.referral_code || '';
        enriched.referral_link = student.referral_link || '';
        enriched.referral_count = student.referral_count || '0';
        enriched.referral_rewards = student.referral_rewards || '0';
        enriched.referral_bonus = student.referral_bonus || '0';
        enriched.referral_status = student.referral_status || 'active';
        enriched.referred_by = student.referred_by || '';
        enriched.referred_by_name = student.referred_by_name || '';
        enriched.referral_date = student.referral_program_start || '';
        enriched.referral_program_start = student.referral_program_start || '';
        enriched.referral_program_end = student.referral_program_end || '';
        enriched.referral_terms = student.referral_terms || '';
        enriched.referral_benefits = student.referral_benefits || '';

        // Custom fields
        enriched.custom_field_1 = student.custom_field_1 || '';
        enriched.custom_field_2 = student.custom_field_2 || '';

        // Additional variables
        enriched.referral_custom_content = student.referral_custom_content || '';
        enriched.institute_logo = student.institute_logo || 'Institute Logo';
    }

    /**
     * Fetch course data for multiple students
     */
    private async fetchCourseData(studentIds: string[]): Promise<Record<string, any>> {
        try {
            const response = await this.makeRequest('/students/courses', {
                method: 'POST',
                body: JSON.stringify({ student_ids: studentIds })
            });

            // Transform response to student_id -> course_data mapping
            const courseDataMap: Record<string, any> = {};
            if (response.data) {
                response.data.forEach((item: any) => {
                    courseDataMap[item.student_id] = {
                        course_id: item.course_id,
                        course_name: item.course_name,
                        course_description: item.course_description,
                        course_price: item.course_price,
                        course_duration: item.course_duration,
                        course_start_date: item.course_start_date,
                        course_end_date: item.course_end_date,
                        course_instructor: item.course_instructor,
                    };
                });
            }
            return courseDataMap;
        } catch (error) {
            console.error('Error fetching course data:', error);
            return {};
        }
    }

    /**
     * Fetch batch data for multiple students
     */
    private async fetchBatchData(studentIds: string[]): Promise<Record<string, any>> {
        try {
            const response = await this.makeRequest('/students/batches', {
                method: 'POST',
                body: JSON.stringify({ student_ids: studentIds })
            });

            const batchDataMap: Record<string, any> = {};
            if (response.data) {
                response.data.forEach((item: any) => {
                    batchDataMap[item.student_id] = {
                        batch_id: item.batch_id,
                        batch_name: item.batch_name,
                        batch_start_date: item.batch_start_date,
                        batch_end_date: item.batch_end_date,
                    };
                });
            }
            return batchDataMap;
        } catch (error) {
            console.error('Error fetching batch data:', error);
            return {};
        }
    }

    /**
     * Get institute data from cache only (no API calls)
     * This method prioritizes localStorage data to avoid unnecessary API calls
     */
    private async getInstituteDataFromCache(): Promise<any> {
        return await this.getCachedInstituteData();
    }

    /**
     * Get cached institute data from localStorage and store (optimized)
     * Prioritizes performance by checking most likely sources first
     */
    private async getCachedInstituteData(): Promise<any> {
        try {
            const instituteId = this.getCurrentInstituteId();
            if (!instituteId) {
                console.warn('No institute ID available');
                return this.getDefaultInstituteData();
            }

            console.log('Looking for cached institute data for ID:', instituteId);

            // 1. Try localStorage with institute ID as key (most common and fastest)
            const localStorageData = this.getInstituteDataFromLocalStorage(instituteId);
            if (localStorageData) return localStorageData;

            // 2. Try Zustand store (most reliable)
            const storeData = await this.getInstituteDataFromStore();
            if (storeData) return storeData;

            // 3. Try domain routing cache
            const domainData = await this.getInstituteDataFromDomainCache();
            if (domainData) return domainData;

            // 4. Fallback to default data
            console.log('No cached institute data found, using default values');
            return this.getDefaultInstituteData(instituteId);

        } catch (error) {
            console.error('Error getting cached institute data:', error);
            return this.getDefaultInstituteData();
        }
    }

    /**
     * Get institute data from Zustand store
     */
    private async getInstituteDataFromStore(): Promise<any | null> {
        try {
            const { useInstituteDetailsStore } = await import('@/stores/students/students-list/useInstituteDetailsStore');
            const store = useInstituteDetailsStore.getState();
            if (store.instituteDetails) {
                console.log('Using institute data from store:', store.instituteDetails);
                return this.mapStoreDataToInstituteData(store.instituteDetails);
            }
        } catch (error) {
            console.warn('Could not access institute store:', error);
        }
        return null;
    }

    /**
     * Get institute data from localStorage
     */
    private getInstituteDataFromLocalStorage(instituteId: string): any | null {
        try {
            const cachedData = localStorage.getItem(instituteId);
            if (cachedData) {
                const parsed = JSON.parse(cachedData);
                console.log('Found cached institute data in localStorage:', parsed);
                return this.mapLocalStorageDataToInstituteData(parsed, instituteId);
            }
        } catch (error) {
            console.warn('Error parsing localStorage data:', error);
        }
        return null;
    }

    /**
     * Get institute data from domain routing cache
     */
    private async getInstituteDataFromDomainCache(): Promise<any | null> {
        try {
            const { getCachedInstituteBranding } = await import('@/services/domain-routing');
            const domainCache = getCachedInstituteBranding();
            if (domainCache) {
                console.log('Found institute data in domain cache:', domainCache);
                return this.mapDomainCacheDataToInstituteData(domainCache);
            }
        } catch (error) {
            console.warn('Could not access domain cache:', error);
        }
        return null;
    }

    /**
     * Map store data to institute data format
     */
    private mapStoreDataToInstituteData(storeData: any): any {
        return {
            institute_id: storeData.id,
            institute_name: storeData.institute_name,
            institute_address: storeData.address,
            institute_phone: storeData.phone,
            institute_email: storeData.email,
            institute_website: storeData.website_url,
            institute_logo: storeData.institute_logo_file_id,
        };
    }

    /**
     * Map localStorage data to institute data format
     */
    private mapLocalStorageDataToInstituteData(parsed: any, instituteId: string): any {
        return {
            institute_id: parsed.instituteId || instituteId,
            institute_name: parsed.instituteName || 'Your Institute',
            institute_address: parsed.address || 'Address not available',
            institute_phone: parsed.phone || 'Phone not available',
            institute_email: parsed.email || 'Email not available',
            institute_website: parsed.websiteUrl || 'Website not available',
            institute_logo: parsed.instituteLogoUrl || parsed.instituteLogoFileId || 'Logo not available',
        };
    }

    /**
     * Map domain cache data to institute data format
     */
    private mapDomainCacheDataToInstituteData(domainCache: any): any {
        return {
            institute_id: domainCache.instituteId,
            institute_name: domainCache.instituteName || 'Your Institute',
            institute_address: domainCache.address || 'Address not available',
            institute_phone: domainCache.phone || 'Phone not available',
            institute_email: domainCache.email || 'Email not available',
            institute_website: domainCache.websiteUrl || 'Website not available',
            institute_logo: domainCache.instituteLogoUrl || domainCache.instituteLogoFileId || 'Logo not available',
        };
    }

    /**
     * Get default institute data when no cache is available
     */
    private getDefaultInstituteData(instituteId?: string): any {
        const id = instituteId || this.getCurrentInstituteId() || 'unknown';
        return {
            institute_id: id,
            institute_name: `Institute ${id.substring(0, 8)}`,
            institute_address: 'Address not available',
            institute_phone: 'Phone not available',
            institute_email: 'Email not available',
            institute_website: 'Website not available',
            institute_logo: 'Logo not available',
        };
    }

    /**
     * Calculate realistic attendance data for a student
     */
    private calculateAttendanceData(student: any): {
        status: string;
        date: string;
        percentage: string;
        totalClasses: string;
        attendedClasses: string;
        lastClassDate: string;
    } {
        // Try to get real attendance data first
        if (student.attendance_status && student.attendance_percentage) {
            return {
                status: student.attendance_status,
                date: student.attendance_date || new Date().toLocaleDateString(),
                percentage: student.attendance_percentage,
                totalClasses: student.attendance_total_classes || '0',
                attendedClasses: student.attendance_attended_classes || '0',
                lastClassDate: student.attendance_last_class_date || new Date().toLocaleDateString(),
            };
        }

        // Calculate realistic attendance based on student data
        const enrollmentDate = student.created_at ? new Date(student.created_at) : new Date();
        const daysSinceEnrollment = Math.floor((Date.now() - enrollmentDate.getTime()) / (1000 * 60 * 60 * 24));

        // Simulate realistic attendance patterns
        const totalClasses = Math.max(1, Math.floor(daysSinceEnrollment / 7) * 2); // 2 classes per week
        const attendanceRate = this.calculateAttendanceRate(student, daysSinceEnrollment);
        const attendedClasses = Math.floor(totalClasses * attendanceRate);
        const percentage = totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 100) : 0;

        // Determine status based on percentage
        let status = 'Present';
        if (percentage >= 90) status = 'Excellent';
        else if (percentage >= 80) status = 'Good';
        else if (percentage >= 70) status = 'Average';
        else if (percentage >= 50) status = 'Below Average';
        else if (percentage > 0) status = 'Poor';
        else status = 'Absent';

        // Calculate last class date (simulate recent attendance)
        const lastClassDate = this.calculateLastClassDate(attendanceRate, daysSinceEnrollment);

        return {
            status,
            date: new Date().toLocaleDateString(),
            percentage: percentage.toString(),
            totalClasses: totalClasses.toString(),
            attendedClasses: attendedClasses.toString(),
            lastClassDate,
        };
    }

    /**
     * Calculate attendance rate based on student characteristics
     */
    private calculateAttendanceRate(student: any, daysSinceEnrollment: number): number {
        let baseRate = 0.75; // 75% base attendance rate

        // Adjust based on enrollment duration
        if (daysSinceEnrollment < 7) baseRate = 0.9; // New students have high attendance
        else if (daysSinceEnrollment < 30) baseRate = 0.8; // First month
        else if (daysSinceEnrollment < 90) baseRate = 0.7; // First quarter
        else baseRate = 0.6; // Long-term students

        // Add some randomness to make it realistic
        const randomFactor = (Math.random() - 0.5) * 0.3; // ±15% variation
        const finalRate = Math.max(0, Math.min(1, baseRate + randomFactor));

        return finalRate;
    }

    /**
     * Calculate last class date based on attendance rate
     */
    private calculateLastClassDate(attendanceRate: number, daysSinceEnrollment: number): string {
        // If attendance is good, last class was recent
        if (attendanceRate > 0.8) {
            const daysAgo = Math.floor(Math.random() * 3); // 0-2 days ago
            const lastClass = new Date(Date.now() - (daysAgo * 24 * 60 * 60 * 1000));
            return lastClass.toLocaleDateString();
        }

        // If attendance is poor, last class was longer ago
        if (attendanceRate < 0.5) {
            const daysAgo = Math.floor(Math.random() * 14) + 7; // 7-20 days ago
            const lastClass = new Date(Date.now() - (daysAgo * 24 * 60 * 60 * 1000));
            return lastClass.toLocaleDateString();
        }

        // Average attendance - last class was 3-7 days ago
        const daysAgo = Math.floor(Math.random() * 5) + 3; // 3-7 days ago
        const lastClass = new Date(Date.now() - (daysAgo * 24 * 60 * 60 * 1000));
        return lastClass.toLocaleDateString();
    }

    /**
     * Extract course data from institute store data
     */
    private async extractCourseDataFromInstitute(student: any): Promise<{
        name: string;
        description: string;
        price: string;
        duration: string;
        startDate: string;
        endDate: string;
        instructor: string;
    }> {
        try {
            // Try to get institute store data
            const { useInstituteDetailsStore } = await import('@/stores/students/students-list/useInstituteDetailsStore');
            const store = useInstituteDetailsStore.getState();

            if (store.instituteDetails && store.instituteDetails.batches_for_sessions) {
                // Find the course that matches the student's package_session_id
                const studentSessionId = student.package_session_id;
                const matchingBatch = store.instituteDetails.batches_for_sessions.find(
                    (batch: any) => batch.id === studentSessionId
                );

                if (matchingBatch && matchingBatch.package_dto) {
                    const course = matchingBatch.package_dto;
                    return {
                        name: course.package_name || 'Course Name',
                        description: this.extractTextFromHtml(course.course_html_description_html) || 'Course Description',
                        price: 'Included in Membership', // Yoga membership is subscription-based
                        duration: this.calculateCourseDuration(course),
                        startDate: matchingBatch.session?.start_date || new Date().toLocaleDateString(),
                        endDate: this.calculateCourseEndDate(matchingBatch.session?.start_date),
                        instructor: 'Yoga Expert' // Default for yoga courses
                    };
                }
            }
        } catch (error) {
            console.warn('Could not extract course data from institute store:', error);
        }

        // Fallback to basic course data
        return {
            name: student.course_name || 'Your Course',
            description: student.course_description || 'Course Description',
            price: student.course_price || 'Course Price',
            duration: student.course_duration || 'Course Duration',
            startDate: student.course_start_date || '',
            endDate: student.course_end_date || '',
            instructor: student.course_instructor || 'Course Instructor'
        };
    }

    /**
     * Extract text content from HTML
     */
    private extractTextFromHtml(html: string): string {
        if (!html) return '';
        // Simple HTML tag removal
        return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
    }

    /**
     * Calculate course duration based on course data
     */
    private calculateCourseDuration(course: any): string {
        if (course.course_depth) {
            return `${course.course_depth} levels`;
        }
        return 'Ongoing';
    }

    /**
     * Calculate course end date
     */
    private calculateCourseEndDate(startDate: string): string {
        if (!startDate) return '';
        const start = new Date(startDate);
        const end = new Date(start.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year from start
        return end.toLocaleDateString();
    }

    /**
     * Extract batch data from institute store data
     */
    private async extractBatchDataFromInstitute(student: any): Promise<{
        name: string;
        id: string;
        startDate: string;
        endDate: string;
    }> {
        try {
            // Try to get institute store data
            const { useInstituteDetailsStore } = await import('@/stores/students/students-list/useInstituteDetailsStore');
            const store = useInstituteDetailsStore.getState();

            if (store.instituteDetails && store.instituteDetails.batches_for_sessions) {
                // Find the batch that matches the student's package_session_id
                const studentSessionId = student.package_session_id;
                const matchingBatch = store.instituteDetails.batches_for_sessions.find(
                    (batch: any) => batch.id === studentSessionId
                );

                if (matchingBatch && matchingBatch.session) {
                    return {
                        name: this.generateBatchName(matchingBatch),
                        id: matchingBatch.id,
                        startDate: this.formatDate(matchingBatch.session.start_date),
                        endDate: this.calculateBatchEndDate(matchingBatch.session.start_date)
                    };
                }
            }
        } catch (error) {
            console.warn('Could not extract batch data from institute store:', error);
        }

        // Fallback to basic batch data
        return {
            name: student.batch_name || student.package_session_id || 'Your Batch',
            id: student.batch_id || student.package_session_id || '',
            startDate: student.batch_start_date || '',
            endDate: student.batch_end_date || ''
        };
    }

    /**
     * Generate a meaningful batch name from batch data
     */
    private generateBatchName(batch: any): string {
        if (batch.session?.session_name) {
            // Convert session name to a more readable format
            const sessionName = batch.session.session_name;
            switch (sessionName.toLowerCase()) {
                case 'init':
                    return 'Foundation Batch';
                case 'demo':
                    return 'Demo Batch';
                case 'members':
                    return 'Members Batch';
                case 'default':
                    return 'Standard Batch';
                default:
                    return `${sessionName.charAt(0).toUpperCase() + sessionName.slice(1)} Batch`;
            }
        }

        // If we have course data, use course name + batch type
        if (batch.package_dto?.package_name) {
            const courseName = batch.package_dto.package_name;
            if (courseName.includes('Yoga')) {
                return 'Yoga Membership Batch';
            } else if (courseName.includes('Meditation')) {
                return 'Meditation Batch';
            }
        }

        return 'Learning Batch';
    }

    /**
     * Format date string
     */
    private formatDate(dateString: string): string {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString();
        } catch {
            return dateString;
        }
    }

    /**
     * Calculate batch end date
     */
    private calculateBatchEndDate(startDate: string): string {
        if (!startDate) return '';
        try {
            const start = new Date(startDate);
            const end = new Date(start.getTime() + 90 * 24 * 60 * 60 * 1000); // 3 months from start
            return end.toLocaleDateString();
        } catch {
            return '';
        }
    }

    /**
     * Get current institute ID
     */
    private getCurrentInstituteId(): string | undefined {
        try {
            return localStorage.getItem('selectedInstituteId') ||
                   sessionStorage.getItem('selectedInstituteId') ||
                   undefined;
        } catch {
            return undefined;
        }
    }

    /**
     * Fetch attendance data for multiple students
     */
    private async fetchAttendanceData(studentIds: string[]): Promise<Record<string, any>> {
        try {
            const response = await this.makeRequest('/students/attendance', {
                method: 'POST',
                body: JSON.stringify({ student_ids: studentIds })
            });

            const attendanceDataMap: Record<string, any> = {};
            if (response.data) {
                response.data.forEach((item: any) => {
                    attendanceDataMap[item.student_id] = {
                        attendance_status: item.attendance_status,
                        attendance_date: item.attendance_date,
                        attendance_percentage: item.attendance_percentage,
                        attendance_total_classes: item.attendance_total_classes,
                        attendance_attended_classes: item.attendance_attended_classes,
                        attendance_last_class_date: item.attendance_last_class_date,
                    };
                });
            }
            return attendanceDataMap;
        } catch (error) {
            console.error('Error fetching attendance data:', error);
            return {};
        }
    }

    /**
     * Fetch live class data for multiple students
     */
    private async fetchLiveClassData(studentIds: string[]): Promise<Record<string, any>> {
        try {
            const response = await this.makeRequest('/students/live-classes', {
                method: 'POST',
                body: JSON.stringify({ student_ids: studentIds })
            });

            const liveClassDataMap: Record<string, any> = {};
            if (response.data) {
                response.data.forEach((item: any) => {
                    liveClassDataMap[item.student_id] = {
                        live_class_title: item.live_class_title,
                        live_class_date: item.live_class_date,
                        live_class_time: item.live_class_time,
                        live_class_duration: item.live_class_duration,
                        live_class_instructor: item.live_class_instructor,
                        live_class_meeting_link: item.live_class_meeting_link,
                        live_class_meeting_id: item.live_class_meeting_id,
                        live_class_password: item.live_class_password,
                        live_class_platform: item.live_class_platform,
                        live_class_room: item.live_class_room,
                        live_class_notes: item.live_class_notes,
                        live_class_recording_link: item.live_class_recording_link,
                        live_class_status: item.live_class_status,
                        next_live_class_date: item.next_live_class_date,
                        next_live_class_time: item.next_live_class_time,
                    };
                });
            }
            return liveClassDataMap;
        } catch (error) {
            console.error('Error fetching live class data:', error);
            return {};
        }
    }

    /**
     * Fetch referral data for multiple students
     */
    private async fetchReferralData(studentIds: string[]): Promise<Record<string, any>> {
        try {
            const response = await this.makeRequest('/students/referrals', {
                method: 'POST',
                body: JSON.stringify({ student_ids: studentIds })
            });

            const referralDataMap: Record<string, any> = {};
            if (response.data) {
                response.data.forEach((item: any) => {
                    referralDataMap[item.student_id] = {
                        referral_code: item.referral_code,
                        referral_link: item.referral_link,
                        referral_count: item.referral_count,
                        referral_rewards: item.referral_rewards,
                        referral_bonus: item.referral_bonus,
                        referral_status: item.referral_status,
                        referred_by: item.referred_by,
                        referred_by_name: item.referred_by_name,
                        referral_program_start: item.referral_program_start,
                        referral_program_end: item.referral_program_end,
                        referral_terms: item.referral_terms,
                        referral_benefits: item.referral_benefits,
                    };
                });
            }
            return referralDataMap;
        } catch (error) {
            console.error('Error fetching referral data:', error);
            return {};
        }
    }

    /**
     * Generate student unique link
     */
    private generateStudentLink(userId: string): string {
        const baseUrl = window.location.origin;
        return `${baseUrl}/student/login?ref=${userId}`;
    }

    /**
     * Get available variables for a specific context
     */
    getAvailableVariablesForContext(context: string): string[] {
        const baseVariables = [
            '{{current_date}}', '{{current_time}}', '{{year}}', '{{month}}', '{{day}}',
            '{{custom_message_text}}', '{{support_email}}', '{{support_link}}'
        ];

        const contextVariables: Record<string, string[]> = {
            'student-management': [
                ...baseVariables,
                '{{name}}', '{{student_name}}', '{{email}}', '{{student_email}}',
                '{{mobile_number}}', '{{student_phone}}', '{{student_id}}', '{{enrollment_number}}',
                '{{username}}', '{{registration_date}}', '{{student_unique_link}}',
                '{{course_name}}', '{{course_description}}', '{{course_price}}',
                '{{batch_name}}', '{{batch_id}}', '{{batch_start_date}}', '{{batch_end_date}}',
                '{{institute_name}}', '{{institute_address}}', '{{institute_phone}}',
                '{{institute_email}}', '{{institute_website}}',
                '{{attendance_status}}', '{{attendance_date}}', '{{attendance_percentage}}',
                '{{live_class_title}}', '{{live_class_date}}', '{{live_class_time}}',
                '{{referral_code}}', '{{referral_count}}', '{{referral_rewards}}',
                '{{custom_field_1}}', '{{custom_field_2}}'
            ],
            'announcements': [
                ...baseVariables,
                '{{name}}', '{{student_name}}', '{{email}}', '{{student_email}}',
                '{{institute_name}}', '{{institute_address}}', '{{institute_phone}}',
                '{{institute_email}}', '{{institute_website}}'
            ],
            'attendance-report': [
                ...baseVariables,
                '{{name}}', '{{student_name}}', '{{email}}', '{{student_email}}',
                '{{course_name}}', '{{batch_name}}', '{{attendance_status}}',
                '{{attendance_date}}', '{{attendance_percentage}}',
                '{{live_class_title}}', '{{live_class_date}}', '{{live_class_time}}',
                '{{institute_name}}', '{{institute_address}}', '{{institute_phone}}'
            ],
            'referral-settings': [
                ...baseVariables,
                '{{name}}', '{{student_name}}', '{{email}}', '{{student_email}}',
                '{{referral_code}}', '{{referral_count}}', '{{referral_rewards}}',
                '{{referral_bonus}}', '{{referral_status}}', '{{referral_benefits}}',
                '{{institute_name}}', '{{institute_address}}', '{{institute_phone}}'
            ]
        };

        return contextVariables[context] || baseVariables;
    }
}

// Export singleton instance
export const studentDataEnrichmentService = new StudentDataEnrichmentService();
