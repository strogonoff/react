/* eslint-disable no-console */
import React, {useCallback, useContext, useEffect} from 'react'
import {useAnchoredPosition, useOnEscapePress} from '../hooks'
import Overlay, {OverlayProps} from '../Overlay'
import {ComponentProps} from '../utils/types'
import {AutocompleteContext} from './AutocompleteContext'
import {useRefObjectAsForwardedRef} from '../hooks/useRefObjectAsForwardedRef'

type AutocompleteOverlayInternalProps = {
  /**
   * The ref of the element that the position of the menu is based on. By default, the menu is positioned based on the text input
   */
  menuAnchorRef?: React.RefObject<HTMLElement>
  /**
   * Props to be spread on the internal `Overlay` component.
   */
  overlayProps?: Partial<OverlayProps>
  children?: React.ReactNode
} & Partial<OverlayProps> &
  Pick<React.AriaAttributes, 'aria-labelledby'> // TODO: consider making 'aria-labelledby' required

function AutocompleteOverlay({
  menuAnchorRef,
  overlayProps: oldOverlayProps,
  children,
  ...newOverlayProps
}: AutocompleteOverlayInternalProps) {
  const autocompleteContext = useContext(AutocompleteContext)
  if (autocompleteContext === null) {
    throw new Error('AutocompleteContext returned null values')
  }
  const overlayProps = {...oldOverlayProps, ...newOverlayProps}
  const {inputRef, scrollContainerRef, selectedItemLength, setShowMenu, showMenu = false} = autocompleteContext
  const {floatingElementRef, position} = useAnchoredPosition(
    {
      side: 'outside-bottom',
      align: 'start',
      anchorElementRef: menuAnchorRef ? menuAnchorRef : inputRef,
    },
    [showMenu, selectedItemLength],
  )

  useRefObjectAsForwardedRef(scrollContainerRef, floatingElementRef)

  const escCloseOptionList = useCallback(
    (e: KeyboardEvent) => {
      console.log('think')
      if (e.key === 'Escape' && showMenu) {
        console.log(e, showMenu)
        // e.preventDefault()
        // e.stopPropagation()
        setShowMenu(false)
        return null
        // e.stopImmediatePropagation()
      }
    },
    [setShowMenu, showMenu],
  )

  const closeOptionList = useCallback(() => {
    setShowMenu(false)
  }, [setShowMenu])
  useEffect(() => {
    console.log('showMenu', showMenu)
  }, [showMenu])

  // useOnEscapePress(
  //   (event: KeyboardEvent) => {
  //     console.log('escape in overlay')
  //     // setShowMenu(false)
  //     // event.preventDefault()
  //     // if (showMenu) {
  //     //   setShowMenu(false)
  //     //   event.stopPropagation()
  //     // }
  //   },
  //   [showMenu, setShowMenu],
  // )

  if (typeof window === 'undefined') {
    return null
  }

  return (
    <Overlay
      returnFocusRef={inputRef}
      preventFocusOnOpen={true}
      onClickOutside={closeOptionList}
      onEscape={escCloseOptionList}
      ref={floatingElementRef as React.RefObject<HTMLDivElement>}
      top={position?.top}
      left={position?.left}
      visibility={showMenu ? 'visible' : 'hidden'}
      sx={{
        overflow: 'auto',
      }}
      {...overlayProps}
    >
      {children}
    </Overlay>
  )
}

AutocompleteOverlay.displayName = 'AutocompleteOverlay'

export type AutocompleteOverlayProps = ComponentProps<typeof AutocompleteOverlay>
export default AutocompleteOverlay
