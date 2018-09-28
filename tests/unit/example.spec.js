import { shallowMount } from '@vue/test-utils';
import HelloWorld from '@/components/HelloWorld.vue';

describe('HelloWorld.vue', () => {
  it('renders props.name when passed', () => {
    const name = 'new message';
    const wrapper = shallowMount(HelloWorld, {
      propsData: { name }
    });
    expect(wrapper.text()).toMatch(name);
  });
});
