import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Email-summary settings page: provider preset, SMTP fields, password, and
 * summary preference, persisted through the `remote.emailSummary` Host Remote.
 * @module @deepseek-ai/dsh-client-ui-email-summary/client/EmailSettingsSection
 */
import { useCallback, useEffect, useState } from 'react';
const row = { display: 'flex', flexDirection: 'column', gap: 4 };
const field = { padding: '6px 8px', borderRadius: 4 };
/**
 * A plain form: the provider select fills host/port/security from the preset;
 * Save writes settings and (when entered) the credential-backed password.
 * @param props - the injected Remote and bound translator.
 */
export function EmailSettingsSection({ api, t }) {
    const [settings, setSettings] = useState(null);
    const [presets, setPresets] = useState([]);
    const [password, setPassword] = useState('');
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);
    useEffect(() => {
        let alive = true;
        void api.getSettings().then((result) => {
            if (!alive)
                return;
            setSettings(result.settings);
            setPresets(result.presets);
        });
        return () => { alive = false; };
    }, [api]);
    const patch = useCallback((partial) => {
        setSettings(current => (current === null ? current : { ...current, ...partial }));
    }, []);
    const onProvider = useCallback((id) => {
        const preset = presets.find(item => item.id === id);
        if (preset !== undefined) {
            patch({ provider: id, smtpHost: preset.host, smtpPort: preset.port, secure: preset.secure });
        }
        else {
            patch({ provider: id });
        }
    }, [presets, patch]);
    const onSave = useCallback(() => {
        if (settings === null || saving)
            return;
        setSaving(true);
        setMessage(null);
        void (async () => {
            const saved = await api.saveSettings({ patch: settings });
            if (password !== '')
                await api.setPassword({ password });
            setSaving(false);
            setMessage(saved.ok ? t('settings.saved') : (saved.error ?? t('settings.error')));
        })();
    }, [settings, saving, password, api, t]);
    if (settings === null)
        return null;
    return (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 560 }, children: [_jsxs("label", { style: row, children: [_jsx("span", { children: t('settings.provider') }), _jsx("select", { style: field, value: settings.provider, onChange: event => onProvider(event.target.value), children: presets.map(preset => _jsx("option", { value: preset.id, children: preset.label }, preset.id)) })] }), _jsxs("label", { style: row, children: [_jsx("span", { children: t('settings.host') }), _jsx("input", { style: field, value: settings.smtpHost, onChange: event => patch({ smtpHost: event.target.value }) })] }), _jsxs("div", { style: { display: 'flex', gap: 14 }, children: [_jsxs("label", { style: { ...row, flex: 1 }, children: [_jsx("span", { children: t('settings.port') }), _jsx("input", { style: field, type: "number", value: settings.smtpPort, onChange: event => patch({ smtpPort: Number(event.target.value) }) })] }), _jsxs("label", { style: { ...row, flex: 1 }, children: [_jsx("span", { children: t('settings.secure') }), _jsxs("select", { style: field, value: settings.secure, onChange: event => patch({ secure: event.target.value }), children: [_jsx("option", { value: "starttls", children: "STARTTLS" }), _jsx("option", { value: "ssl", children: "SSL" }), _jsx("option", { value: "none", children: "None" })] })] })] }), _jsxs("label", { style: row, children: [_jsx("span", { children: t('settings.username') }), _jsx("input", { style: field, value: settings.username, onChange: event => patch({ username: event.target.value }) })] }), _jsxs("label", { style: row, children: [_jsx("span", { children: t('settings.password') }), _jsx("input", { style: field, type: "password", value: password, placeholder: t('settings.passwordHint'), onChange: event => setPassword(event.target.value) })] }), _jsxs("label", { style: row, children: [_jsx("span", { children: t('settings.from') }), _jsx("input", { style: field, value: settings.from, onChange: event => patch({ from: event.target.value }) })] }), _jsxs("label", { style: row, children: [_jsx("span", { children: t('settings.recipient') }), _jsx("input", { style: field, value: settings.defaultRecipient, onChange: event => patch({ defaultRecipient: event.target.value }) })] }), _jsxs("label", { style: row, children: [_jsx("span", { children: t('settings.style') }), _jsxs("select", { style: field, value: settings.style, onChange: event => patch({ style: event.target.value }), children: [_jsx("option", { value: "detailed", children: t('settings.detailed') }), _jsx("option", { value: "brief", children: t('settings.brief') })] })] }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 12 }, children: [_jsx("button", { type: "button", onClick: onSave, disabled: saving, children: saving ? t('settings.saving') : t('settings.save') }), message !== null && _jsx("span", { role: "status", children: message })] }), _jsx("p", { style: { fontSize: 12, opacity: 0.7, margin: 0 }, children: t('settings.passwordHint') })] }));
}
//# sourceMappingURL=EmailSettingsSection.js.map