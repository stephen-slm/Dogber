import { mount } from '@vue/test-utils';
import VueRouter from 'vue-router';
import Vuetify from 'vuetify';
import Vue from 'vue';

import GenericPanel from '@/components/GenericPanel.vue';

describe('GenericPanel.vue', function() {
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

    wrapper = mount(GenericPanel, {
      localVue: localVue,
      propsData: {
        topText: 'top_text_value',
        bottomText: 'bottom_text_value',
        topTextColor: 'red'
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

  it('should contain a div containing the top text value', () => {
    // making sure that our props are passing through our top text value correctly.
    const topTextElement = wrapper.find('.top-text').findAll('div');
    expect(topTextElement.at(1).text()).toBe('top_text_value');
  });

  it('should contain a div containing the bottom text value', () => {
    // making sure that the bottom text of the generic panel is correctly displaying the text.
    const bottomTextElement = wrapper.find('.top-text').findAll('div');
    expect(bottomTextElement.at(2).text()).toBe('bottom_text_value');
  });

  it('should reflect the color changes if top color is set', () => {
    // validate that the style color is actually going through and using the props correctly.
    // this is used for styling the txt color on the home page for matching the ui implementation.
    const topTextElement = wrapper.find('.top-text').findAll('div');
    const topText = topTextElement.at(1);
    expect(topText.attributes().style).toBe('color: red;');
  });
});
