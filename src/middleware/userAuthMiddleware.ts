import { Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';
import { IAuthService } from '../application/interfaces/IAuthService';
import { IUserRepository } from '../domain/repositories/IUserRepository';

export const userAuthProtect = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.log("reached in middleware user")
    let token;
    const authHeader = req.headers['authorization'];
    if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.user_jwt) {
        token = req.cookies.user_jwt;
    }

    if (!token) {
        res.status(401).json({ success: false, message: 'Access token missing' });
        return;
    }

    const authService = container.resolve<IAuthService>('IAuthService');
    try {
        const payload = await authService.verifyAccessToken(token);

        // Explicit Role Check from JWT Payload
        if (!payload.role || payload.role.toUpperCase() !== 'USER') {
            console.warn(`[AUTH] 403 Forbidden: User role check failed. Role in payload: ${payload.role}, UserID: ${payload.id}`);
            res.status(403).json({
                success: false,
                message: `Forbidden: User access required. Your role: ${payload.role || 'missing'}`,
            });
            return;
        }

        const userRepository = container.resolve<IUserRepository>('IUserRepository');
        const fullUser = await userRepository.findById(payload.id);

        if (fullUser && fullUser.isActive === false) {
            res.status(403).json({
                success: false,
                message: "Your account has been deactivated. Please contact support.",
                code: "ACCOUNT_INACTIVE"
            });
            return;
        }

        (req as any).user = payload;
        next();
    } catch (err: any) {
        console.error('User access token verification failed:', err.message);
        res.status(401).json({ success: false, message: 'Access token invalid or expired' });
    }
};
