export interface HttpAdpater {
    get<T>( url: string ): Promise<T>;
}