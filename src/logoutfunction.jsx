import { useEffect } from 'preact/hooks';
import Link from './components/Link';
import Cookies from 'universal-cookie';
import wretch from 'wretch';

export default function LogoutPage() {
    useEffect(() => {
        const logout = async () => {
            const cookies = new Cookies(null, { path: '/' });

            const token = cookies.get('noteauth_token');
            const hn = cookies.get('noteauth_hostname');

            cookies.remove('noteauth_hostname');
            cookies.remove('noteauth_token');

            if (token && hn) {
                wretch(`${hn}/auth/logout`)
                    .auth(`Bearer ${token}`)
                    .post();
            }

            window.location.href = '/';
        };

        logout();
    }, []);

    return <p>You are being logged out... <Link href="/">Not being redirected? Click here.</Link></p>;
}