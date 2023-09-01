import { ValidatedCredentials, credentialsSchema } from './User';

export class NoCredentialsFoundError extends Error{
    constructor(message: string){
        super(message);
    }
}

export default class UserCredentialsValidator {
    public validate(data: unknown): ValidatedCredentials{
        if (!data) {
            throw new NoCredentialsFoundError(
                'You should provide the credentials in the body'
            )
        }
      
        const credentials = credentialsSchema.cast(data);
        return credentials;
    }
}