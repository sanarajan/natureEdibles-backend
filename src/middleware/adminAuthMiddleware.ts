import { Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';
import { IAuthService } from '../application/interfaces/IAuthService';

export const adminAuthProtect = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let token;
    const authHeader = req.headers['authorization'];
    if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.admin_jwt) {
        token = req.cookies.admin_jwt;
    }

    if (!token) {
        res.status(401).json({ success: false, message: 'Access token missing' });
        return;
    }

    const authService = container.resolve<IAuthService>('IAuthService');
    try {
        const payload = await authService.verifyAccessToken(token);
console.log(payload+" payload und "+payload.role.toUpperCase() +" rolename")
        // Explicit Role Check
        if (payload.role.toUpperCase() !== 'ADMIN') {
            res.status(403).json({ success: false, message: 'Forbidden: Admin access required' });
            return;
        }

        // Explicit Role Header Check
        const roleHeader = req.headers['role'] as string;
        if (roleHeader && roleHeader.toLowerCase() !== 'admin') {
            res.status(403).json({ success: false, message: 'Unauthorized: Role mismatch' });
            return;
        }

        (req as any).user = payload;
        next();
    } catch (err: any) {
        console.error('Admin access token verification failed:', err.message);
        res.status(401).json({ success: false, message: 'Access token invalid or expired' });
    }
};
