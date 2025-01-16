'use client';

import { Component } from 'react';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className="container mx-auto px-4 py-8">
                    <div className="text-red-500">Something went wrong. Please try again later.</div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary; 