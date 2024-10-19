
export class ResponsePageDto {
    readonly code: number;
    readonly message: string;
    readonly data: {
        content: any[],
        total: number,
        currentPage: number,
        pageSize: number,
        totalPages: number
    };
}