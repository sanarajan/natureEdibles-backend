import { container } from 'tsyringe';
import { LoginUseCase } from '../../application/usecases/LoginUseCase';
import { RegisterUseCase } from '../../application/usecases/RegisterUseCase';
import { VerifyEmailUseCase } from '../../application/usecases/VerifyEmailUseCase';
import { AuthService } from '../../application/services/AuthService';

import { CreateConsultationBookingUseCase } from '../../application/use-cases/consultation/CreateConsultationBookingUseCase';
import { GetAvailableSlotsUseCase } from '../../application/use-cases/consultation/GetAvailableSlotsUseCase';
import { GetUserConsultationsUseCase } from '../../application/use-cases/consultation/GetUserConsultationsUseCase';
import { GetAdminConsultationsUseCase } from '../../application/use-cases/consultation/GetAdminConsultationsUseCase';
import { UpdateConsultationStatusUseCase } from '../../application/use-cases/consultation/UpdateConsultationStatusUseCase';
import { GetConsultationByIdUseCase } from '../../application/use-cases/consultation/GetConsultationByIdUseCase';
import { GetConsultationSettingsUseCase } from '../../application/use-cases/consultation/GetConsultationSettingsUseCase';
import { UpdateConsultationSettingsUseCase } from '../../application/use-cases/consultation/UpdateConsultationSettingsUseCase';
import { UpdateConsultationPaymentUseCase } from '../../application/use-cases/consultation/UpdateConsultationPaymentUseCase';

import { GetUserNotificationsUseCase } from '../../application/use-cases/notification/GetUserNotificationsUseCase';
import { MarkNotificationReadUseCase } from '../../application/use-cases/notification/MarkNotificationReadUseCase';

// UseCases
container.registerSingleton<LoginUseCase>('ILoginUseCase', LoginUseCase);
container.registerSingleton<RegisterUseCase>('IRegisterUseCase', RegisterUseCase);
container.registerSingleton<VerifyEmailUseCase>('IVerifyEmailUseCase', VerifyEmailUseCase);

// Consultation
container.registerSingleton<CreateConsultationBookingUseCase>('ICreateConsultationBookingUseCase', CreateConsultationBookingUseCase);
container.registerSingleton<GetAvailableSlotsUseCase>('IGetAvailableSlotsUseCase', GetAvailableSlotsUseCase);
container.registerSingleton<GetUserConsultationsUseCase>('IGetUserConsultationsUseCase', GetUserConsultationsUseCase);
container.registerSingleton<GetAdminConsultationsUseCase>('IGetAdminConsultationsUseCase', GetAdminConsultationsUseCase);
container.registerSingleton<UpdateConsultationStatusUseCase>('IUpdateConsultationStatusUseCase', UpdateConsultationStatusUseCase);
container.registerSingleton<GetConsultationByIdUseCase>('IGetConsultationByIdUseCase', GetConsultationByIdUseCase);
container.registerSingleton<GetConsultationSettingsUseCase>('IGetConsultationSettingsUseCase', GetConsultationSettingsUseCase);
container.registerSingleton<UpdateConsultationSettingsUseCase>('IUpdateConsultationSettingsUseCase', UpdateConsultationSettingsUseCase);
container.registerSingleton<UpdateConsultationPaymentUseCase>('IUpdateConsultationPaymentUseCase', UpdateConsultationPaymentUseCase);

// Application Services
container.registerSingleton<AuthService>('IAuthService', AuthService);

// Notifications
container.registerSingleton<GetUserNotificationsUseCase>('IGetUserNotificationsUseCase', GetUserNotificationsUseCase);
container.registerSingleton<MarkNotificationReadUseCase>('IMarkNotificationReadUseCase', MarkNotificationReadUseCase);
