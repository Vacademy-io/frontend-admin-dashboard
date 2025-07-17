import * as amplitude from '@amplitude/analytics-browser';

// Your Amplitude API key
const AMPLITUDE_API_KEY = '75574e8d7f2962284f6d3ce468e2278d';

// Initialize Amplitude
export const initializeAmplitude = () => {
  try {
    amplitude.init(AMPLITUDE_API_KEY, {
      autocapture: true,
      // Additional options you can configure:
      // defaultTracking: {
      //   sessions: true,
      //   pageViews: true,
      //   formInteractions: true,
      //   fileDownloads: true,
      // },
    });
    console.log('Amplitude initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Amplitude:', error);
  }
};

// Track custom events
export const trackEvent = (eventName: string, eventProperties?: any) => {
  try {
    amplitude.track(eventName, eventProperties);
  } catch (error) {
    console.error('Failed to track event:', error);
  }
};

// Track user identification
export const identifyUser = (userId: string, userProperties?: any) => {
  try {
    amplitude.setUserId(userId);
    if (userProperties) {
      const identifyEvent = new amplitude.Identify();
      Object.keys(userProperties).forEach(key => {
        identifyEvent.set(key, userProperties[key]);
      });
      amplitude.identify(identifyEvent);
    }
  } catch (error) {
    console.error('Failed to identify user:', error);
  }
};

// Track page views manually (if needed)
export const trackPageView = (pageName: string, additionalProperties?: any) => {
  try {
    amplitude.track('Page View', {
      page_name: pageName,
      ...additionalProperties,
    });
  } catch (error) {
    console.error('Failed to track page view:', error);
  }
};

// Common event tracking functions
export const amplitudeEvents = {
  // Authentication events
  signUp: (method?: string) => trackEvent('Sign Up', { method }),
  signIn: (method?: string) => trackEvent('Sign In', { method }),
  signOut: () => trackEvent('Sign Out'),
  
  // Navigation events
  navigateToPage: (pageName: string) => trackEvent('Navigate to Page', { page_name: pageName }),
  
  // Feature usage events
  useFeature: (featureName: string, context?: any) => trackEvent('Feature Used', { 
    feature_name: featureName,
    ...context 
  }),
  
  // Assessment events
  createAssessment: () => trackEvent('Assessment Created'),
  submitAssessment: (assessmentId: string) => trackEvent('Assessment Submitted', { assessment_id: assessmentId }),
  
  // Student management events
  enrollStudent: () => trackEvent('Student Enrolled'),
  inviteStudent: () => trackEvent('Student Invited'),
  
  // Study library events
  accessStudyLibrary: () => trackEvent('Study Library Accessed'),
  viewContent: (contentType: string) => trackEvent('Content Viewed', { content_type: contentType }),
};

export default amplitude; 