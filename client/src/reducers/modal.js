import * as actions from 'actions/indexActions';

import { renderFormModal } from '../config'

const defaultState = {
  isModalActive: renderFormModal,
  isModalActive: false,
  isOnboardingActive: renderFormModal, 
  modalType: 'WELCOME',
  modalProps: null,
  rootModalClass: 'unfold'    
};

export const modal = (state = defaultState, action) => {
  switch (action.type) {
    case actions.TOGGLE_IS_MODAL_ACTIVE:
    case actions.DELETE_PROJECT_REQUEST:
      return {
        ...state,
        isModalActive: !state.isModalActive,
      };
    case actions.TOGGLE_ONBOARD_MODE:
      return {
        ...state,
        rootModalClass: 'roadrunner',
        isModalActive: !state.isModalActive,
        isOnboardingActive: !state.isOnboardingActive,
      };
    case actions.TOGGLE_ADD_TASKS_FORM:
      return {
        ...state,
        isModalActive: !state.isModalActive,
        modalType: 'ADD_TASKS'
      };
    case actions.CHANGE_MODAL_TYPE:
      return {
        ...state,
        modalType: action.modalType,
      };
    case actions.UPDATE_MODAL_PROPS:
      return {
        ...state,
        modalProps: action.modalProps,
      };
    case actions.CONFIRM_PROJECT_DELETE:
      return {
        shouldRenderModal: true,
        modalType: 'CONFIRM',
        modalProps: action.modalProps,
      };

    default:
      return state;
  }
};
