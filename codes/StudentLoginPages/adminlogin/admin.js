const ctx = document.getElementById('attendanceChart').getContext('2d');

const attendanceData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
        label: 'Attendance %',
        data: [],
        backgroundColor: '#6c8cff',
        borderColor: '#3f51b5',
        tension: 0.4,
        fill: true
    }]
};

const attendanceChart = new Chart(ctx, {
    type: 'line',
    data: attendanceData,
    options: {
        responsive: true,
        plugins: {
            legend: { display: false }
        },
        scales: {
            y: {
                min: 80,
                max: 100,
                ticks: {
                    callback: value => value + '%'
                }
            }
        }
    }
});

/* 🔁 Simulate real-time update */
setInterval(() => {
    attendanceChart.data.datasets[0].data.shift();
    attendanceChart.data.datasets[0].data.push(
        Math.floor(Math.random() * (98 - 88 + 1)) + 88
    );
    attendanceChart.update();
}, 3000);
