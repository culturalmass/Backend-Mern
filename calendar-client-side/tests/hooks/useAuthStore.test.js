const { configureStore } = require("@reduxjs/toolkit");
const { renderHook, waitFor } = require("@testing-library/react");
const { act } = require("react-dom/test-utils");
const { Provider } = require("react-redux");
const { calendarApi } = require("../../src/api");
const { useAuthStore } = require("../../src/hooks");
const { authSlice } = require("../../src/store");
const { initialState, notAuthenticatedState } = require("../fixtures/authStates");
const { testUserCredentials } = require("../fixtures/testUser");


const getMockStore = (initialState) => {
    return configureStore({
        reducer: {
            auth: authSlice.reducer,

        },
        preloadedState: {
            auth: {...initialState}
        },
    })
}

describe('Pruebas en el useAuthStore', () => {

    beforeEach(() => localStorage.clear());

    test('debe de regresar los valores por defecto', () => {
        const mockStore = getMockStore({...initialState});
        const {result} = renderHook(() => useAuthStore(), {
            wrapper: ({children}) => <Provider store={mockStore}>{children}</Provider>
        });
        expect(result.current).toEqual({
            errorMessage: undefined,
            status: 'checking',
            user: {},
            checkAuthToken: expect.any(Function),
            startLogin: expect.any(Function),
            startLogout: expect.any(Function),
            startRegister: expect.any(Function),
        });
    });
    test('startLogin debe de realizar el login correctamente', async() => {

        const mockStore = getMockStore({...notAuthenticatedState});
        const {result} = renderHook(() => useAuthStore(), {
            wrapper: ({children}) => <Provider store={mockStore}>{children}</Provider>
        });
        await act(async() => {
            await result.current.startLogin(testUserCredentials);
        });
        const {errorMessage, status, user} = result.current;
        expect({errorMessage,status, user}).toEqual({
            errorMessage: undefined,
            status: 'authenticated',
            user: {name: 'Test', uid: '631af3b762fd420016ea2e3e'}
        });
        expect(localStorage.getItem('token')).toEqual(expect.any(String));
        expect(localStorage.getItem('token-init-date')).toEqual(expect.any(String));
    });
    test('startLogin debe de fallar la autenticacion', async() => {

        const mockStore = getMockStore({...notAuthenticatedState});
        const {result} = renderHook(() => useAuthStore(), {
            wrapper: ({children}) => <Provider store={mockStore}>{children}</Provider>
        });
        await act(async() => {
            await result.current.startLogin({email: 'algo@google.com', password: '123456789'});
        });
        const {errorMessage, status, user} = result.current;
        expect(localStorage.getItem('token')).toBe(null);
        expect({errorMessage, status, user}).toEqual({
            errorMessage: 'Credenciales incorrectas',
            status: 'not-authenticated',
            user: {}
        });
        waitFor(
            () => expect(result.current.errorMessage).toBe(undefined)
        );
    });
    test('startRegister debe de crear un usuario', async() => {
        const newUser = {email: 'algo@google.com', password: '123456789', name: 'TestUserRegister'};
        const mockStore = getMockStore({...notAuthenticatedState});
        const {result} = renderHook(() => useAuthStore(), {
            wrapper: ({children}) => <Provider store={mockStore}>{children}</Provider>
        });
        const spy = jest.spyOn(calendarApi, 'post').mockReturnValue({
            data: {
                ok: true,
                uid: "1263781293",
                name: "Test User",
                token: "ALGUN-TOKEN"
            },
        });        
        await act(async() => {
            await result.current.startRegister(newUser);
        });
        const {errorMessage, status, user} = result.current;
        expect({errorMessage, status, user}).toEqual({
            errorMessage: undefined,
            status: 'authenticated',
            user: {name: 'Test User', uid: '1263781293'}
        });
        spy.mockRestore();
    });
    test('startRegister debe de fallar la creacion', async() => {
        const mockStore = getMockStore({...notAuthenticatedState});
        const {result} = renderHook(() => useAuthStore(), {
            wrapper: ({children}) => <Provider store={mockStore}>{children}</Provider>
        });
     
        await act(async() => {
            await result.current.startRegister(testUserCredentials);
        });
        const {errorMessage, status, user} = result.current;
        expect({errorMessage, status, user}).toEqual({
            errorMessage: 'Un usuario existe con ese correo',
            status: 'not-authenticated',
            user: {}
        });
    });
    test('checkAuthToken debe de fallar si no hay token', async() => {
        const mockStore = getMockStore({...initialState});
        const {result} = renderHook(() => useAuthStore(), {
            wrapper: ({children}) => <Provider store={mockStore}>{children}</Provider>
        });
        
        await act(async() => {
            await result.current.checkAuthToken();
        });
        const {errorMessage, status, user} = result.current;
        expect({errorMessage, status, user}).toEqual({
            errorMessage: undefined,
            status: 'not-authenticated',
            user: {}
        });
    });
    test('checkAuthToken debe de autenticar el usuario si hay un token', async() => {
        const {data} = await calendarApi.post('/auth', testUserCredentials);
        localStorage.setItem('token', data.token);

        const mockStore = getMockStore({...initialState});
        const {result} = renderHook(() => useAuthStore(), {
            wrapper: ({children}) => <Provider store={mockStore}>{children}</Provider>
        });
        
        await act(async() => {
            await result.current.checkAuthToken()
        });
        const {errorMessage, status, user} = result.current;
        console.log(result.current)
        expect({errorMessage, status, user}).toEqual({
            errorMessage: undefined,
            status: 'authenticated',
            user: {name: 'Test', uid: '631af3b762fd420016ea2e3e'}
        });


    });


});