import { mount } from '@vue/test-utils';
import VueRouter from 'vue-router';
import Vuetify from 'vuetify';
import Vue from 'vue';

import RatingPanel from '@/components/RatingPanel.vue';

describe('RatingPanel.vue', function() {
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

    wrapper = mount(RatingPanel, {
      localVue: localVue,
      propsData: {
        topText: 'top_text_value',
        bottomText: 'bottom_text_value',
        topTextColor: 'red',
        rating: 5
      },
      slots: {
        default: '<div>slot_default_value</div>'
      }
    });
  });

  it('Should be a instance of a vue', () => {
    // we have to make sure that we are actually on the view component, this could lead to use
    // testing nothing that is real, which could be confusing and a waste of time.
    expect(wrapper.isVueInstance()).toBeTruthy();
  });

  it('should contain two top-text divs', () => {
    // there is no point testing more about the top text if it does not exist.
    expect(wrapper.find('.top-text').exists()).toBe(true);
  });

  it('should contain a prop of the correct rating.', () => {
    // make sure that the prop data is actually being set.
    expect(wrapper.props('rating')).toEqual(5);
  });

  it('should reflect the color changes if top color is set', () => {
    // validate that the style color is actually going through and using the props correctly.
    // this is used for styling the txt color on the home page for matching the ui implementation.
    const topTextElement = wrapper.find('.top-text').findAll('div');
    const topText = topTextElement.at(1);
    expect(topText.attributes().style).toBe('color: red;');
  });

  it('should contain the valid slot div, allowing passing in children', () => {
    // The generic panel takes in body conent that is used to display this information on the right
    // hand side of the component, this is important as we don't know what the user wants
    // displaying. So it must correctly pass in the correct data as the slot.
    const slot = wrapper.find('.text-right').findAll('div');
    const slotDiv = slot.at(1);

    // validate that our slot is data is actually existing.
    expect(slotDiv.text()).toBe('slot_default_value');
  });
});
