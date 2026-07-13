import { container } from 'tsyringe';
import { UserRepository } from '../database/repositories/UserRepository';
import { EmailService } from '../services/EmailService';
import { JwtService } from '../services/JwtService';
import { PasswordService } from '../services/PasswordService';
import { RazorpayService } from '../services/RazorpayService';

import { ConsultationSettingsRepository } from '../database/repositories/ConsultationSettingsRepository';
import { ConsultationBookingRepository } from '../database/repositories/ConsultationBookingRepository';

// Repositories
container.registerSingleton<UserRepository>('IUserRepository', UserRepository);
container.registerSingleton<ConsultationSettingsRepository>('IConsultationSettingsRepository', ConsultationSettingsRepository);
container.registerSingleton<ConsultationBookingRepository>('IConsultationBookingRepository', ConsultationBookingRepository);

// Services
container.registerSingleton<EmailService>('IEmailService', EmailService);
container.registerSingleton<JwtService>('IJwtService', JwtService);
container.registerSingleton<PasswordService>('IPasswordService', PasswordService);
container.registerSingleton<RazorpayService>('IRazorpayService', RazorpayService);
