import { Suspense } from 'react';
import { dynamic } from 'next/dynamic';

// ResetPasswordContent component that uses useSearchParams
const ResetPasswordContent = dynamic(() => import('./ResetPasswordContent'), {
    ssr: false
});

// Main page component
export default function ResetPassword() {
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Reset your password
                </h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <Suspense fallback={
                        <div className="flex justify-center items-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        </div>
                    }>
                        <ResetPasswordContent />
                    </Suspense>
                </div>
            </div>
        </div>
    );
} 