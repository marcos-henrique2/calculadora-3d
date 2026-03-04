import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

function showErrorOverlay(message: string) {
	try {
		let el = document.getElementById('global-error-overlay');
		if (!el) {
			el = document.createElement('div');
			el.id = 'global-error-overlay';
			Object.assign(el.style, {
				position: 'fixed',
				inset: '12px',
				padding: '16px',
				background: 'rgba(255,255,255,0.98)',
				color: '#b91c1c',
				border: '1px solid rgba(0,0,0,0.08)',
				zIndex: '999999',
				fontFamily: 'system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif',
				whiteSpace: 'pre-wrap',
				overflow: 'auto',
				maxHeight: '80vh',
			});
			document.body.appendChild(el);
		}
		el.textContent = 'Erro detectado: ' + message;
		console.error('Global overlay error:', message);
	} catch (e) {
		console.error('Failed to show error overlay', e);
	}
}

window.addEventListener('error', (ev) => {
	showErrorOverlay(String(ev.error ?? ev.message ?? 'Unknown error'));
});

window.addEventListener('unhandledrejection', (ev) => {
	showErrorOverlay(String((ev.reason && (ev.reason.stack || ev.reason.message)) || ev.reason || 'Unhandled rejection'));
});

try {
	const rootEl = document.getElementById('root');
	if (!rootEl) {
		showErrorOverlay('Elemento #root não encontrado no DOM');
		throw new Error('Root element not found');
	}
	// Render the full application. Errors will be shown by the global overlay or ErrorBoundary.
	createRoot(rootEl).render(<App />);
} catch (err: any) {
	showErrorOverlay(String(err && (err.stack || err.message) || err));
}
