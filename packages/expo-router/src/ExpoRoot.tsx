import Constants from 'expo-constants'
import { StatusBar } from 'expo-status-bar'
import React, { Fragment, type FunctionComponent, type ReactNode } from 'react'
import { Platform } from 'react-native'
// import { GestureHandlerRootView as _GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import type { NavigationContainerProps } from '@react-navigation/native'
import UpstreamNavigationContainer from './fork/NavigationContainer'
import { useInitializeExpoRouter } from './global-state/router-store'
import type { RequireContext } from './types'
import { SplashScreen } from './views/Splash'
import { Head } from './head'

export type ExpoRootProps = {
  context: RequireContext
  location?: URL
  wrapper?: FunctionComponent<{ children: ReactNode }>
  navigationContainerProps?: NavigationContainerProps & {
    theme?: {
      dark: boolean
      colors: {
        primary: string
        background: string
        card: string
        text: string
        border: string
        notification: string
      }
    }
  }
}

// function getGestureHandlerRootView() {
//   try {
//     if (!_GestureHandlerRootView) {
//       return React.Fragment
//     }

//     // eslint-disable-next-line no-inner-declarations
//     function GestureHandler(props: any) {
//       return <_GestureHandlerRootView style={{ flex: 1 }} {...props} />
//     }
//     if (process.env.NODE_ENV === 'development') {
//       // @ts-expect-error
//       GestureHandler.displayName = 'GestureHandlerRootView'
//     }
//     return GestureHandler
//   } catch {
//     return React.Fragment
//   }
// }

// const GestureHandlerRootView = getGestureHandlerRootView()

const INITIAL_METRICS = {
  frame: { x: 0, y: 0, width: 0, height: 0 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
}

const hasViewControllerBasedStatusBarAppearance =
  Platform.OS === 'ios' &&
  !!Constants.expoConfig?.ios?.infoPlist?.UIViewControllerBasedStatusBarAppearance

export function ExpoRoot({
  wrapper: ParentWrapper = Fragment,
  navigationContainerProps,
  ...props
}: ExpoRootProps) {
  /*
   * Due to static rendering we need to wrap these top level views in second wrapper
   * View's like <GestureHandlerRootView /> generate a <div> so if the parent wrapper
   * is a HTML document, we need to ensure its inside the <body>
   */
  const wrapper: ExpoRootProps['wrapper'] = ({ children }) => {
    return (
      <Head.Provider context={globalThis['vxrn__headContext__']}>
        <ParentWrapper>
          {/* <GestureHandlerRootView> */}
          <SafeAreaProvider
            // SSR support
            initialMetrics={INITIAL_METRICS}
            style={{
              flex: 1,
            }}
          >
            {children}

            {/* Users can override this by adding another StatusBar element anywhere higher in the component tree. */}
            {!hasViewControllerBasedStatusBarAppearance && <StatusBar style="auto" />}
          </SafeAreaProvider>
          {/* </GestureHandlerRootView> */}
        </ParentWrapper>
      </Head.Provider>
    )
  }

  return (
    <ContextNavigator
      navigationContainerProps={navigationContainerProps}
      {...props}
      wrapper={wrapper}
    />
  )
}

const initialUrl =
  Platform.OS === 'web' && typeof window !== 'undefined' ? new URL(window.location.href) : undefined

function ContextNavigator({
  context,
  location: initialLocation = initialUrl,
  wrapper: WrapperComponent = Fragment,
  navigationContainerProps,
}: ExpoRootProps) {
  const store = useInitializeExpoRouter(context, initialLocation)

  if (store.shouldShowTutorial()) {
    SplashScreen.hideAsync()
    if (process.env.NODE_ENV === 'development') {
      return (
        <WrapperComponent>
          {/* TODO */}
          {/* <Tutorial /> */}
          <React.Fragment />
        </WrapperComponent>
      )
    }
    // Ensure tutorial styles are stripped in production.
    return null
  }

  const Component = store.rootComponent

  return (
    <UpstreamNavigationContainer
      ref={store.navigationRef}
      initialState={store.initialState}
      linking={store.linking}
      documentTitle={{
        enabled: false,
      }}
      {...navigationContainerProps}
    >
      <WrapperComponent>
        <Component />
      </WrapperComponent>
    </UpstreamNavigationContainer>
  )
}
