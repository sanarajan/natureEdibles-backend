/**
 * Subscription utility functions for calendar-month calculation and schedule management.
 */

export function parseDateOnly(dateInput: string | Date): Date {
    if (typeof dateInput === 'string') {
        // Strip time if present and parse YYYY-MM-DD safely in local/UTC context
        const dateStr = dateInput.split('T')[0];
        const [year, month, day] = dateStr.split('-').map(Number);
        return new Date(year, month - 1, day);
    }
    const d = new Date(dateInput);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function formatDateToYYYYMMDD(d: Date): string {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

/**
 * Calculates the calendar-month end date for a subscription.
 * Handles month-end dates safely (e.g., Jan 31 + 1 month -> Feb 28/29).
 */
export function calculateSubscriptionEndDate(startDateInput: string | Date, durationMonths: number): Date {
    const start = parseDateOnly(startDateInput);
    const startYear = start.getFullYear();
    const startMonth = start.getMonth(); // 0 to 11
    const startDay = start.getDate();

    const targetMonthTotal = startMonth + durationMonths;
    const targetYear = startYear + Math.floor(targetMonthTotal / 12);
    const targetMonth = targetMonthTotal % 12;

    const daysInTargetMonth = new Date(targetYear, targetMonth + 1, 0).getDate();

    let endYear = targetYear;
    let endMonth = targetMonth;
    let endDay: number;

    if (startDay === 1) {
        // Ends on last day of previous month from targetMonth
        const prevMonthDate = new Date(targetYear, targetMonth, 0);
        endYear = prevMonthDate.getFullYear();
        endMonth = prevMonthDate.getMonth();
        endDay = prevMonthDate.getDate();
    } else {
        const candidateDay = startDay - 1;
        endDay = Math.min(candidateDay, daysInTargetMonth);
    }

    return new Date(endYear, endMonth, endDay);
}
