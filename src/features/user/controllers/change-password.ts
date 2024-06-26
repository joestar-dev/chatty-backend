import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { joiValidation } from '@root/features/decorators/joi-validation.decorators';
import { changePasswordSchema } from '@user/schemes/info';
import { BadRequestError } from '@global/helpers/error-handler';
import { authService } from '@service/db/auth.service';
import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { userService } from '@service/db/user.service';
import { IResetPasswordParams } from '@user/interfaces/user.interface';
import { resetPasswordTemplate } from '@service/emails/templates/reset-password/reset-password-template';
import { emailQueue } from '@service/queues/email.queue';
import moment from 'moment';
import publicIP from 'ip';

export class Update {
  @joiValidation(changePasswordSchema)
  public async password(req: Request, res: Response): Promise<void> {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    if (newPassword !== confirmPassword) {
      throw new BadRequestError('Password do not match.');
    }
    const existingUser: IAuthDocument = await authService.getAuthUserByUsername(req.currentUser!.username);
    const passwordsMatch: boolean = await existingUser.comparePassword(currentPassword);
    if (!passwordsMatch) {
      throw new BadRequestError('Invalid credentials.');
    }

    const hashedPassword: string = await existingUser.hashPassword(newPassword);
    await userService.updatePassword(`${req.currentUser!.username }`, hashedPassword);

    const templateParams: IResetPasswordParams = {
      username: existingUser!.username,
      email: existingUser!.email,
      ipaddress: publicIP.address(),
      date: moment().format('DD/MM/YYYY HH:mm')
    };

    const template: string = resetPasswordTemplate.passwordResetConfirmationTemplate(templateParams);
    emailQueue.addEmailJob('changePassword', { receiverEmail: existingUser!.email, template, subject: 'Password update confirmation.' });

    res.status(HTTP_STATUS.OK).json(
      { message: 'Password updated successfully. You will be redirected shortly to the login page' }
    );
  }
}
