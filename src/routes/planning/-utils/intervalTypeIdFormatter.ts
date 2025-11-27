export function formatIntervalTypeId(intervalTypeId: string): string {
    // Daily: YYYY-MM-DD -> "Nov 26"
    if (/^\d{4}-\d{2}-\d{2}$/.test(intervalTypeId)) {
        const date = new Date(intervalTypeId);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        });
    }

    // Weekly: YYYY_D0X -> "Mon"
    if (/^\d{4}_D0[1-7]$/.test(intervalTypeId)) {
        const dayNum = parseInt(intervalTypeId.slice(-1));
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        return days[dayNum - 1] || intervalTypeId;
    }

    // Monthly: YYYY_MM_W0X -> "W4 Apr"
    if (/^\d{4}_\d{2}_W0[1-5]$/.test(intervalTypeId)) {
        const parts = intervalTypeId.split('_');
        if (parts.length >= 3) {
            const month = parseInt(parts[1]!);
            const week = parts[2]!.slice(-1);

            const monthNames = [
                'Jan',
                'Feb',
                'Mar',
                'Apr',
                'May',
                'Jun',
                'Jul',
                'Aug',
                'Sep',
                'Oct',
                'Nov',
                'Dec',
            ];

            return `W${week} ${monthNames[month - 1]}`;
        }
    }

    // Yearly Month: YYYY_MXX -> "Jan 24"
    if (/^\d{4}_M(0[1-9]|1[0-2])$/.test(intervalTypeId)) {
        const parts = intervalTypeId.split('_');
        if (parts.length >= 2) {
            const year = parts[0]?.slice(2); // 2024 -> 24
            const monthStr = parts[1];
            const month = parseInt(monthStr!.slice(1));

            const monthNames = [
                'Jan',
                'Feb',
                'Mar',
                'Apr',
                'May',
                'Jun',
                'Jul',
                'Aug',
                'Sep',
                'Oct',
                'Nov',
                'Dec',
            ];

            return `${monthNames[month - 1]} '${year}`;
        }
    }

    // Yearly Quarter: YYYY_Q0X -> "Q1"
    if (/^\d{4}_Q0[1-4]$/.test(intervalTypeId)) {
        const parts = intervalTypeId.split('_');
        if (parts.length >= 2) {
            const quarter = parts[1]; // Q01
            const quarterNum = parseInt(quarter!.slice(2));

            switch (quarterNum) {
                case 1:
                    return 'Jan - Mar';
                case 2:
                    return 'Apr - Jun';
                case 3:
                    return 'Jul - Sep';
                case 4:
                    return 'Oct - Dec';
                default:
                    return `Q${quarterNum}`;
            }
        }
    }

    return intervalTypeId;
}
