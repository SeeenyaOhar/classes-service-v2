export default class ResourceNotExistsError extends Error{
    key: string;
    constructor(message: string, key: string){
        super(message);
        this.key = key;
    }
}