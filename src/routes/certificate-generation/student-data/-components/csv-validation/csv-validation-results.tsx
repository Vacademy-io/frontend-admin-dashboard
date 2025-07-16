import { CsvValidationResult } from '@/types/certificate/certificate-types';
import { formatValidationError, formatValidationWarning } from '../../-utils/csv-validation';
import { CheckCircle, XCircle, Warning, Info } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface CsvValidationResultsProps {
    validationResult: CsvValidationResult;
}

export const CsvValidationResults = ({ validationResult }: CsvValidationResultsProps) => {
    const [showDetails, setShowDetails] = useState(false);
    
    const { isValid, errors, warnings } = validationResult;
    const hasErrors = errors.length > 0;
    const hasWarnings = warnings.length > 0;

    return (
        <div className="space-y-3">
            {/* Summary Card */}
            <div className={cn(
                'rounded-lg border p-4 transition-all duration-200',
                isValid
                    ? 'border-green-200 bg-green-50'
                    : 'border-red-200 bg-red-50'
            )}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            'rounded-full p-1.5',
                            isValid ? 'bg-green-100' : 'bg-red-100'
                        )}>
                            {isValid ? (
                                <CheckCircle className="size-5 text-green-600" />
                            ) : (
                                <XCircle className="size-5 text-red-600" />
                            )}
                        </div>
                        
                        <div>
                            <h4 className={cn(
                                'text-sm font-medium',
                                isValid ? 'text-green-700' : 'text-red-700'
                            )}>
                                {isValid ? 'CSV Validation Passed' : 'CSV Validation Failed'}
                            </h4>
                            <p className="text-xs text-neutral-600 mt-0.5">
                                {hasErrors && `${errors.length} error${errors.length > 1 ? 's' : ''}`}
                                {hasErrors && hasWarnings && ' • '}
                                {hasWarnings && `${warnings.length} warning${warnings.length > 1 ? 's' : ''}`}
                                {!hasErrors && !hasWarnings && 'All checks passed successfully'}
                            </p>
                        </div>
                    </div>

                    {(hasErrors || hasWarnings) && (
                        <button
                            onClick={() => setShowDetails(!showDetails)}
                            className="text-xs text-neutral-500 hover:text-neutral-700 underline transition-colors duration-200"
                        >
                            {showDetails ? 'Hide Details' : 'Show Details'}
                        </button>
                    )}
                </div>
            </div>

            {/* Detailed Results */}
            {showDetails && (hasErrors || hasWarnings) && (
                <div className="space-y-3">
                    {/* Errors */}
                    {hasErrors && (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <XCircle className="size-4 text-red-600" />
                                <h5 className="text-sm font-medium text-red-700">
                                    Errors ({errors.length})
                                </h5>
                            </div>
                            <div className="space-y-2">
                                {errors.map((error, index) => (
                                    <div
                                        key={index}
                                        className="flex items-start gap-2 p-2 rounded-md bg-red-100/50 border border-red-200/50"
                                    >
                                        <div className="rounded-full bg-red-200 p-1 mt-0.5">
                                            <div className="size-1.5 rounded-full bg-red-600"></div>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs text-red-700 leading-relaxed">
                                                {formatValidationError(error)}
                                            </p>
                                            {error.type && (
                                                <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-red-200 text-red-700 text-xs font-medium">
                                                    {error.type.replace('_', ' ')}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Warnings */}
                    {hasWarnings && (
                        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <Warning className="size-4 text-amber-600" />
                                <h5 className="text-sm font-medium text-amber-700">
                                    Warnings ({warnings.length})
                                </h5>
                            </div>
                            <div className="space-y-2">
                                {warnings.map((warning, index) => (
                                    <div
                                        key={index}
                                        className="flex items-start gap-2 p-2 rounded-md bg-amber-100/50 border border-amber-200/50"
                                    >
                                        <div className="rounded-full bg-amber-200 p-1 mt-0.5">
                                            <div className="size-1.5 rounded-full bg-amber-600"></div>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs text-amber-700 leading-relaxed">
                                                {formatValidationWarning(warning)}
                                            </p>
                                            {warning.type && (
                                                <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-amber-200 text-amber-700 text-xs font-medium">
                                                    {warning.type.replace('_', ' ')}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Help Text */}
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                        <div className="flex items-start gap-2">
                            <Info className="size-4 text-blue-600 mt-0.5" />
                            <div className="text-xs text-blue-700 leading-relaxed">
                                <p className="font-medium mb-1">CSV Requirements:</p>
                                <ul className="space-y-0.5 list-disc list-inside">
                                    <li>First 3 columns must be: user_id, enrollment_number, student_name</li>
                                    <li>All selected students must be included in the CSV</li>
                                    <li>No additional students beyond those selected</li>
                                    <li>Headers after the 3rd column must be unique</li>
                                    <li>File size must not exceed 1MB</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}; 