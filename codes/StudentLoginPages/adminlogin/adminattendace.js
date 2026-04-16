const ctx = document.getElementById('attendanceChart').getContext('2d');

const attendanceChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
            label: 'Lecture Attendance',
            data: [92, 94, 95, 93, 96, 0, 0], // will come from Firestore later
            borderColor: '#10b981',   // GREEN
            backgroundColor: 'rgba(16,185,129,0.15)',
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#10b981',
            fill: true
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: { display: false }
        },
        scales: {
            y: {
                min: 0,
                max: 100,
                ticks: {
                    callback: value => value + '%'
                }
            }
        }
    }
});
