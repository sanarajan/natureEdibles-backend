export class ConsultationBooking {
    constructor(
        public readonly id: string,
        public userId: string,
        // Basic Details
        public fullName: string,
        public age: number,
        public gender: string,
        public height: string,
        public currentWeight: string,
        public maritalStatus: string,
        public occupation: string,
        public contactNumber: string,
        public city: string,
        public country: string,
        // Main Health Concern
        public mainHealthIssue: string,
        public yearsFacingIssue: string,
        public medicalTreatment: string,
        public treatmentDetails: string,
        public currentMedicines: string,
        public medicalReports: string[], // URLs or file paths
        // Infertility Section (Optional)
        public tryingToConceiveSince: string = '',
        public miscarriageHistory: string = '',
        public ivfIui: string = '',
        public menstrualCycle: string = '',
        public diagnosedCondition: string = '',
        // Lifestyle
        public wakeUpTime: string,
        public sleepTime: string,
        public exercise: string,
        public exerciseType: string,
        public stressLevel: string,
        public waterIntake: string,
        public bowelMovement: string,
        // Current Food Pattern
        public vegetarian: boolean,
        public nonVegetarian: boolean,
        public teaCoffee: string,
        public sugar: string,
        public outsideFood: string,
        public riceWheat: string,
        public foodAllergies: string,
        // Body Symptoms
        public symptoms: string[], // Array of checkboxes
        // Commitment
        public readyForNaturalDiet: boolean,
        public readyToAvoidSugar: boolean,
        public familySupport: boolean,
        // Appointment Booking
        public appointmentDate: string, // YYYY-MM-DD
        public appointmentTime: string, // HH:mm
        // System / Admin
        public status: string = 'Pending', // Pending, Confirmed, Completed, Cancelled
        public doctorNotes: string = '',
        public recommendedProducts: string[] = [], // Product IDs
        public readonly createdAt: Date = new Date(),
        public readonly updatedAt: Date = new Date()
    ) {}
}
