import { mount } from '@vue/test-utils';
import VueRouter from 'vue-router';
import Vuetify from 'vuetify';
import Vue from 'vue';

import GiveFeedback from '@/components/GiveFeedback.vue';

describe('GiveFeedback.vue', function() {
  let wrapper = null;

  /**
   * before we start we will create a instance of vuew and mount our component, this will contain
   * some props, returning a component wrapper we can perfrom tests on. This wrapper is accessable
   * by all tests that are described wtihin the wrapper.
   */
  beforeAll(() => {
    const localVue = Vue;
    localVue.use(VueRouter);
    localVue.use(Vuetify);

    const app = document.createElement('div');
    app.setAttribute('data-app', true);
    document.body.append(app);

    wrapper = mount(GiveFeedback, {
      localVue: localVue,
      attachToDocument: true,
      propsData: {
        showFeedback: false,
        submit: (message) => message
      }
    });
  });

  it('Should be a instance of a vue', () => {
    // we have to make sure that we are actually on the view component, this could lead to use
    // testing nothing that is real, which could be confusing and a waste of time.
    expect(wrapper.isVueInstance()).toBeTruthy();
  });

  it('Should be hidden when the show feedback props data is set', () => {
    // validate that the props data is false and the underlining local variable is also false.
    expect(wrapper.props('showFeedback')).toEqual(false);
    expect(wrapper.vm.showFeedbackLocal).toEqual(false);
  });

  it('Should have a default feedback message of blank', () => {
    // There should be no existing feedback message on display, otherwise it could mislead the user
    // and confuse the process. Having no message will allow for a clean introduction to a new
    // feedback for the user.
    expect(wrapper.vm.feedbackMessage).toEqual('');
    expect(wrapper.vm.feedbackMessage).toEqual(expect.any(String));
  });

  it('Should reflect the changes of the showFeedback prop if it changes', () => {
    // if we acutally tell it to show externally,then we are expecting it to be triggered internally
    // as well.
    wrapper.setProps({ showFeedback: true });

    // validate that the prop was updated and the underlining local trigger.
    expect(wrapper.props('showFeedback')).toEqual(true);
    expect(wrapper.vm.showFeedbackLocal).toEqual(true);
  });

  it('Should reflect on the feedback message when the data field text changes', () => {
    // when the user inputs text, it should reflect this on the message data prop which will be
    // later used in the submit method.
    wrapper.setProps({ showFeedback: true });

    // update and validate the changes made it through.
    wrapper.setData({ feedbackMessage: 'text_input_value' });
    expect(document.querySelectorAll('input')[0].value).toEqual(wrapper.vm.feedbackMessage);
  });

  it('Should call the submit function when the button is clicked', (done) => {
    // we update hte submit function to validate that once we call the submit that the changes will
    // go through and complete the test. Otherwise it will time out and fail.
    wrapper.setData({
      submitLocal: () => {
        expect(wrapper.vm.feedbackMessage).toEqual('text_input_value_submit');
        done();
      }
    });

    // lets update and set the value correctly.
    wrapper.setProps({ showFeedback: true });
    wrapper.setData({ feedbackMessage: 'text_input_value_submit' });

    // perform the click action to test the functionality.
    document.getElementById('feedsubmit').click();
  });

  it('Should set the showFeedbackLocal to false if the cancel button is pressed', () => {
    // the user should be able to cancel whenever they like without being forced to then complete
    // the feedback process.
    wrapper.setProps({ showFeedback: true });
    wrapper.setData({ feedbackMessage: 'text_input_value_submit' });

    // click the cancel button to validate that it hides the text input.
    document.getElementById('feedcancel').click();
    expect(wrapper.vm.showFeedbackLocal).toEqual(false);
  });
});
