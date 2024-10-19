export class SendMailDto {
    type?: string;
    from: string;
    to: string;
    subject: string;
    content: string;
}
