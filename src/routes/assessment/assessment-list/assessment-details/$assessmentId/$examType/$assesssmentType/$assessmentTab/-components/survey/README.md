# Survey Assessment Feature

This directory contains the survey-specific components for the assessment details page. The implementation follows a modular approach to ensure that survey features don't affect other assessment types.

## Structure

```
survey/
├── README.md                           # This documentation
├── types.ts                           # TypeScript interfaces and types
├── hooks/
│   └── useSurveyData.ts               # Custom React hooks for data fetching
├── SurveyMainOverviewTab.tsx          # Main overview tab for surveys
└── SurveyIndividualRespondentsTab.tsx # Individual respondents view
```

## Features

### 1. Survey Main Overview Tab
- **Aggregated Analytics**: Total participants, completion rate, average response time
- **Question Analysis**: Individual question breakdowns with visualizations
- **Interactive Charts**: Bar charts and pie charts using Recharts
- **Key Insights**: Top insights and trends from survey responses
- **API Integration**: Real-time data from backend services

### 2. Individual Respondents Tab
- **Respondent List**: Searchable table of all survey participants
- **Response Viewer**: Modal dialog to view individual responses
- **Navigation**: Previous/Next buttons to navigate between respondents
- **Search Functionality**: Filter respondents by name or email
- **API Integration**: Real-time data from backend services

### 3. Custom Hooks
- **useSurveyOverview**: Fetches survey analytics and question data
- **useSurveyRespondents**: Fetches individual respondent data with pagination
- **useSurveyRespondentResponses**: Fetches detailed response data

### 4. Supported Question Types
- **MCQ Single Choice**: Multiple choice with single selection
- **MCQ Multiple Choice**: Multiple choice with multiple selections
- **True/False**: Binary choice questions
- **Short Answer**: Text input responses
- **Long Answer**: Extended text responses
- **Numerical**: Number input responses
- **Rating**: Scale-based rating questions

## Data Structure

### Survey Analytics
```typescript
interface SurveyAnalytics {
    totalParticipants: number;
    completedResponses: number;
    completionRate: number;
    averageResponseTime: string;
    totalQuestions: number;
    averageRating?: number;
}
```

### Question Analytics
```typescript
interface QuestionAnalytics {
    questionId: string;
    questionText: string;
    questionType: SurveyQuestionType;
    totalResponses: number;
    responseDistribution: ResponseDistribution[];
    topInsights: string[];
}
```

### Survey Respondent
```typescript
interface SurveyRespondent {
    id: string;
    name: string;
    email: string;
    completedAt: string;
    responses: SurveyResponse[];
}
```

## Integration

The survey components are conditionally rendered based on the assessment type:

```typescript
// In main assessment details component
{examType === 'SURVEY' ? (
    <SurveyIndividualRespondentsTab />
) : (
    <AssessmentSubmissionsTab type={assesssmentType} />
)}
```

## Mock Data

The implementation includes comprehensive mock data for demonstration:
- 300 total participants
- 247 completed responses (94% completion rate)
- 5 different question types
- 5 sample respondents with detailed responses

## Visualizations

### Charts Used
- **Bar Charts**: Response distribution for each question
- **Pie Charts**: Percentage breakdown of responses
- **Progress Bars**: Completion rate visualization

### Interactive Features
- **Tooltips**: Hover information on charts
- **Responsive Design**: Charts adapt to different screen sizes
- **Color Coding**: Consistent color scheme across visualizations

## Best Practices

### 1. Modular Design
- Each component is self-contained
- Clear separation of concerns
- Reusable data service functions

### 2. Type Safety
- Comprehensive TypeScript interfaces
- Strict typing for all data structures
- Type-safe API functions

### 3. Performance
- Efficient data filtering and searching
- Lazy loading of modal content
- Optimized re-renders

### 4. Accessibility
- Proper ARIA labels
- Keyboard navigation support
- Screen reader compatibility

## Future Enhancements

### Potential Improvements
1. **Real-time Updates**: Live data synchronization
2. **Export Functionality**: PDF/CSV export of survey data
3. **Advanced Filtering**: Date range, response type filters
4. **Word Cloud**: Visual representation of text responses
5. **Trend Analysis**: Time-based response patterns
6. **Custom Visualizations**: Configurable chart types

### API Integration
The current implementation uses mock data. For production, replace the mock service with actual API calls:

```typescript
// Replace mock functions with real API calls
export const getSurveyAnalytics = async (assessmentId: string) => {
    return await api.get(`/assessments/${assessmentId}/survey/analytics`);
};
```

## Testing

### Component Testing
- Unit tests for individual components
- Integration tests for data flow
- Visual regression tests for charts

### Data Testing
- Mock data validation
- Type checking
- Edge case handling

## Dependencies

### Required Packages
- `recharts`: Chart visualization library
- `lucide-react`: Icon components
- `@radix-ui/*`: UI component primitives

### Internal Dependencies
- `@/components/ui/*`: Shared UI components
- `@/types/*`: TypeScript type definitions

## Maintenance

### Code Organization
- Keep components focused on single responsibilities
- Maintain consistent naming conventions
- Document complex logic and calculations

### Data Management
- Update mock data as needed for testing
- Ensure type consistency across components
- Validate data transformations

### Performance Monitoring
- Monitor chart rendering performance
- Optimize data processing functions
- Track component re-render frequency
