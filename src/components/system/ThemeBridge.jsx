import { useEffect } from "react";
import { useConfigStore } from "../../store/configStore";

export default function ThemeBridge() {
  const theme = useConfigStore((s) => s.config.theme);

  useEffect(() => {
    const root = document.documentElement;
    const map = {
      "--menu-bg": theme?.menuBg,
      "--app-bg": theme?.appBg,
      "--panel-bg": theme?.panelBg,
      "--panel-bg2": theme?.panelBg2,
      "--border-color": theme?.borderColor,
      "--accent-color": theme?.accentColor,
      "--button-bg": theme?.buttonBg,
      "--button-text": theme?.buttonText,
      "--text-color": theme?.textColor,
      "--muted-color": theme?.mutedColor,
    };

    Object.entries(map).forEach(([k, v]) => {
      if (v) root.style.setProperty(k, v);
    });
  }, [theme]);

  return null;
}
