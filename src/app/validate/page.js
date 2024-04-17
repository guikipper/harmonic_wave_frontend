'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { validateEmail } from '../api/services/apiFunctions'
import styles from '../styles/Validate.module.css'
import Link from 'next/link'
import { ResponseFeedback } from '../components/ResponseFeedback'

// Obtém o parâmetro da URL

export default function Validate() {

    const [token, setToken] = useState(null);
    const searchParams = useSearchParams();
    const [validationResult, setValidationResult] = useState("");
    const [error, setError] = useState(false)

    useEffect(() => {
        const tokenFromParams = searchParams.get('token');
        if (tokenFromParams) {
            setToken(tokenFromParams);
        }
    }, [searchParams]);

    useEffect(() => {
        const validateEmailAndSetResult = async () => {
            if (token) {
                try {
                    const response = await validateEmail(token);
                    const data = await response.json()
                    console.log(data.details[0].message)
                    setValidationResult(data)
                    console.log(data)
                    if (data.error) {
                        setError(true)
                    }
                } catch (error) {
                    console.error(`Error during email validation: ${error.message}`);
                }
            }
        };
        validateEmailAndSetResult();
    }, [token]);
    
    return (
        <>
        <div className={styles.main}>
           
            <div className={styles.mainContent}>
            {!error ? 
            <>
                {validationResult && validationResult.code != 200 && (
                    <p className={styles.waitingMessage}>Validando email...</p>
                )}
                {validationResult && validationResult.code == 200 && (
                    <div className={styles.validationSuccess}>
                        <p className={styles.successMessage}>Seu email foi validado com sucesso!</p>
                            <Link href="./login">
                                <button className={styles.loginButton}>
                                    <p>Login</p>
                                </button>
                            </Link>
                    </div>   
                )} 
            </>
            : 
            <>
             {validationResult && validationResult.code != 200 && (
                    <ResponseFeedback type={"error"} message={validationResult.message} details={validationResult.details[0].message}/>
                )}
            </>
            }
            
            </div>
        </div>
        </>
    )
}