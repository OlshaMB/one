import '@tamagui/core/reset.css'
import '../public/tamagui.css'

import { TamaguiProvider, isWeb, View } from '@tamagui/core'
import { UserThemeProvider, useUserTheme } from '@tamagui/one-theme'
import { PageLoadProgressBar, ScrollRestoration, Tabs } from 'vxs'
import config from '../tamagui.config'
import { Home } from '@tamagui/lucide-icons'

export default function Layout() {
  return (
    <>
      {isWeb && (
        <>
          <meta charSet="utf-8" />
          <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        </>
      )}

      <ScrollRestoration />
      <PageLoadProgressBar />

      <UserThemeProvider>
        <TamaguiRootProvider>
          <Tabs>
            <Tabs.Screen
              name="(stack)"
              options={{
                title: 'Home',
                tabBarIcon: ({ color }) => <Home size={20} color="red" />,
              }}
            />

            <Tabs.Screen
              name="spa"
              options={{
                title: 'Profile',
                tabBarIcon: ({ color }) => <View width={20} height={20} bg="green" />,
              }}
            />
          </Tabs>
        </TamaguiRootProvider>
      </UserThemeProvider>
    </>
  )
}

const TamaguiRootProvider = ({ children }: { children: React.ReactNode }) => {
  const [{ resolvedTheme }] = useUserTheme()

  return (
    <TamaguiProvider disableInjectCSS config={config} defaultTheme={resolvedTheme}>
      {children}
    </TamaguiProvider>
  )
}
