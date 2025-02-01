"use client";

export function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          try {
            let isDark = false;
            const savedTheme = localStorage.getItem('theme');
            
            if (savedTheme) {
              isDark = savedTheme === 'dark';
            } else {
              isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            }

            if (isDark) {
              document.documentElement.classList.add('dark');
            }
          } catch (e) {}
        `,
      }}
    />
  );
}
