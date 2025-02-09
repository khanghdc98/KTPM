import { Box, ClickAwayListener } from '@mui/material'
import React, { useCallback } from 'react'
import { appActions, useAppDispatch, useAppSelector } from '../../../AppStore'
import './LoadingPopup.css'

const LoadingPopup = () => {
  const loadingMessage = useAppSelector(
    (state) => state.app.loadingPopUpMessage,
  )
  const dispatch = useAppDispatch()
  const setLoadingPopUp = useCallback(
    (message: string) => {
      dispatch(appActions.setLoadingPopUp(message))
    },
    [dispatch],
  )
  return (
    <Box className="loading-popup" style={{ zIndex: '99999', position:"fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
      <ClickAwayListener
        onClickAway={() => {
          if (loadingMessage.includes('Error')) setLoadingPopUp('')
        }}
      >
        <Box className="loading-container">
          {!loadingMessage.includes('Error') && <span className="loader" />}
          {loadingMessage}
        </Box>
      </ClickAwayListener>
    </Box>
  )
}

export default React.memo(LoadingPopup)
