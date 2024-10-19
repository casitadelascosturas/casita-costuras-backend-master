export class CreateProductDto {
    readonly name: string;
    // readonly bar_code: string;
    readonly image?: string;
    readonly status?: boolean;
    readonly description?: string;
    readonly price_sale_max?: number;
    readonly price_sale_min?: number;
  }
  