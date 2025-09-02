/**
 * ThemeContext: provee tema claro/oscuro y useTheme().
 * Mockeable en tests: puedes envolver cualquier componente con ThemeProvider.
 */
import React, { createContext, useState, useContext } from 'react';
import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
	const [isDark, setIsDark] = useState(false);
	const theme = isDark ? MD3DarkTheme : MD3LightTheme;
	const toggleTheme = () => setIsDark((d) => !d);
	return (
		<ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
			{children}
		</ThemeContext.Provider>
	);
}

export function useTheme() {
	return useContext(ThemeContext);
}
// ...existing code...
