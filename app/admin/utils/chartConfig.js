import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js'

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
)

export function chartConfig(data) {
    if (!data) return null

    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                titleColor: '#1F2937',
                bodyColor: '#1F2937',
                borderColor: '#E5E7EB',
                borderWidth: 1,
                padding: 12,
                bodyFont: {
                    size: 14
                },
                titleFont: {
                    size: 14,
                    weight: 'bold'
                }
            }
        },
        scales: {
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    color: '#6B7280',
                    font: {
                        size: 12
                    }
                }
            },
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(156, 163, 175, 0.1)'
                },
                ticks: {
                    color: '#6B7280',
                    font: {
                        size: 12
                    },
                    padding: 8
                }
            }
        }
    }

    // For Line Chart (User Growth)
    if (data.type === 'line') {
        return {
            data: {
                labels: data.labels,
                datasets: [{
                    label: data.label || 'Users',
                    data: data.values,
                    fill: true,
                    borderColor: '#3B82F6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    borderWidth: 2,
                    pointRadius: 4,
                    pointBackgroundColor: '#3B82F6',
                    pointBorderColor: '#FFFFFF',
                    pointBorderWidth: 2,
                    pointHoverRadius: 6
                }]
            },
            options: {
                ...commonOptions,
                plugins: {
                    ...commonOptions.plugins,
                    title: {
                        display: true,
                        text: data.title || '',
                        color: '#1F2937',
                        font: {
                            size: 16,
                            weight: 'bold'
                        },
                        padding: {
                            bottom: 24
                        }
                    }
                }
            }
        }
    }

    // For Bar Chart (Content Activity)
    if (data.type === 'bar') {
        return {
            data: {
                labels: data.labels,
                datasets: [{
                    label: data.label || 'Activity',
                    data: data.values,
                    backgroundColor: [
                        'rgba(59, 130, 246, 0.8)',  // blue
                        'rgba(16, 185, 129, 0.8)',  // green
                        'rgba(245, 158, 11, 0.8)',  // yellow
                        'rgba(139, 92, 246, 0.8)'   // purple
                    ],
                    borderRadius: 4
                }]
            },
            options: {
                ...commonOptions,
                plugins: {
                    ...commonOptions.plugins,
                    title: {
                        display: true,
                        text: data.title || '',
                        color: '#1F2937',
                        font: {
                            size: 16,
                            weight: 'bold'
                        },
                        padding: {
                            bottom: 24
                        }
                    }
                },
                scales: {
                    ...commonOptions.scales,
                    y: {
                        ...commonOptions.scales.y,
                        grid: {
                            display: false
                        }
                    }
                }
            }
        }
    }

    return null
} 