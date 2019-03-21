import { mount, shallowMount } from '@vue/test-utils';
import VueRouter from 'vue-router';
import Vuetify from 'vuetify';
import moment from 'moment';
import Vue from 'vue';

import NotificationItem from '@/components/NotificationItem.vue';

describe('NotificationItem.vue', function() {
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

    wrapper = mount(NotificationItem, {
      localVue: localVue,
      attachToDocument: true,
      propsData: {
        notification: {
          message: 'notification_message',
          title: 'notification_title',
          timestamp: Date.now()
        }
      }
    });
  });

  it('Should be a instance of a vue', () => {
    // we have to make sure that we are actually on the view component, this could lead to use
    // testing nothing that is real, which could be confusing and a waste of time.
    expect(wrapper.isVueInstance()).toBeTruthy();
  });

  it('Should display the message of the feedback in the given field.', () => {
    expect(wrapper.props('notification').message).toEqual('notification_message');
    expect(wrapper.find('.notification-message').text()).toEqual('notification_message');
  });

  it('Should display the title of the feedback in the given field.', () => {
    expect(wrapper.props('notification').title).toEqual('notification_title');
    expect(wrapper.find('.notification-title').text()).toEqual('notification_title');
  });

  it('Should display time remaining text on the sub title section of the notification', () => {
    expect(wrapper.vm.getTimeSince()).toEqual(moment(wrapper.props('notification').timestamp).fromNow());

    // update and use a new time to properly validate that its being updated when a new date time is
    // set on the notification object. Its best to set the whole notification object for safety.
    const newDate = new Date();
    newDate.setFullYear(2001, 1, 10);

    // create a backup which will be set again after the test.
    const backupNotification = wrapper.props('notification');

    // create a copy and update the date time object. setting it back on the wrapper.
    const updatedNotification = JSON.parse(JSON.stringify(backupNotification));
    updatedNotification.timestamp = newDate;

    // revalidate that the date time is actually being updated.
    wrapper.setProps({ notification: updatedNotification });
    expect(wrapper.vm.getTimeSince()).toEqual(moment(newDate).fromNow());

    // updaste the wrapper to coantain the old notification again.
    wrapper.setProps({ notification: backupNotification });
  });

  it('Should display the navigation action if the action type is of type navigation', () => {
    // first validate that it does not exist when we have not set the navigation action on the notification.
    expect(wrapper.find('.action-navigation').exists()).toEqual(false);

    // create a backup which will be set again after the test.
    const backupNotification = wrapper.props('notification');

    // create a copy and aset the related action objects that will be used for testing.
    const updatedNotification = JSON.parse(JSON.stringify(backupNotification));
    updatedNotification.actionType = 'navigation';
    updatedNotification.actionLink = 'link-link';

    const localVue = Vue;
    localVue.use(VueRouter);
    localVue.use(Vuetify);

    // have to recreate a local shallow mounted instance due to how props work on mount, the setting
    // the properties again from the outside does not seem to update the actual internal props.
    let localWrapper = shallowMount(NotificationItem, {
      localVue: localVue,
      propsData: {
        notification: updatedNotification
      }
    });

    expect(localWrapper.find('.action-navigation').exists()).toEqual(true);
    expect(localWrapper.find('.action-navigation').attributes('to')).toEqual('link-link');
  });
});
