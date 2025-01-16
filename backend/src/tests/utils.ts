import * as fs from 'fs';
import config from './config';

export function getAuthData(){
    const filePath = 'src\\tests\\test_login_data.json';
    const rawData = fs.readFileSync(filePath);
    const authData = JSON.parse(rawData.toString());

    return {
        email: authData.email as string,
        password: authData.password as string,
        wrongpassword: authData.wrongpassword as string,
    };
}
