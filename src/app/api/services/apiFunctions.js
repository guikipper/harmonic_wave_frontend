const BASE_URL = "https://friendly-yodel-vgpvrrggpq639xw-3500.app.github.dev"

export const login = async (username, password) => {
    //try catch
    //em caso de error, throw new error()
    //tem que ser POST para enviar as coisas de forma segura
    //para definir um post você precisa atribuir o valor do retorno da api
    //o await fetch recebe dois parâmetros, o endpoint e os demais dados num objeto
    //comumento são a definição do method, os headers e o body
    //o body passa como JSON o username e a senha
    console.log(username, password)
    console.log(`${BASE_URL}/login`)
    try {
        const response = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: username, password }),
          });

          if (!response.ok) {
            throw new Error('Login failed');
          }

          const data = await response.json();
        return data;
        
    } catch (error) {
        throw new Error(`Error during login: ${error.message}`);
    }

}

export const validateEmail = async(token) => {
  try {
    const response = await fetch(`${BASE_URL}/validate/${token}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: 'Validando Email com Token' })
    })

    
    if (!response.ok) {
      throw new Error('Validate failed')
    }

    return response
  } catch (error) {
    throw new Error(`Error during validating email: ${error.message}`);
  }
  
}

export const signUp = async(userData) => {
  try {
    const response = await fetch('https://friendly-yodel-vgpvrrggpq639xw-3500.app.github.dev/createUser', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    const data = await response.json();
    return data
  } catch (error) {
    console.error('Erro:', error);
  }
}