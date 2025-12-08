import {
	createContext,
	useContext,
	useState,
	useEffect,
	useCallback,
	type ReactNode,
} from "react";
import type { User, AuthState, LoginCredentials } from "@/types/auth";

interface AuthContextType extends AuthState {
	login: (credentials: LoginCredentials) => Promise<void>;
	logout: () => void;
}

const AUTH_STORAGE_KEY = "lavapp_auth";

const MOCK_USER: User = {
	id: "1",
	name: "Administrador",
	email: "admin@lavapp.com",
};

const MOCK_PASSWORD = "123456";

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [state, setState] = useState<AuthState>({
		user: null,
		isAuthenticated: false,
		isLoading: true,
	});

	useEffect(() => {
		const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
		if (storedAuth) {
			try {
				const user = JSON.parse(storedAuth) as User;
				setState({
					user,
					isAuthenticated: true,
					isLoading: false,
				});
			} catch {
				localStorage.removeItem(AUTH_STORAGE_KEY);
				setState((prev) => ({ ...prev, isLoading: false }));
			}
		} else {
			setState((prev) => ({ ...prev, isLoading: false }));
		}
	}, []);

	const login = useCallback(async (credentials: LoginCredentials) => {
		await new Promise((resolve) => setTimeout(resolve, 800));

		if (
			credentials.email === MOCK_USER.email &&
			credentials.password === MOCK_PASSWORD
		) {
			localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(MOCK_USER));
			setState({
				user: MOCK_USER,
				isAuthenticated: true,
				isLoading: false,
			});
		} else {
			throw new Error("Email ou senha inválidos");
		}
	}, []);

	const logout = useCallback(() => {
		localStorage.removeItem(AUTH_STORAGE_KEY);
		setState({
			user: null,
			isAuthenticated: false,
			isLoading: false,
		});
	}, []);

	return (
		<AuthContext.Provider value={{ ...state, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
