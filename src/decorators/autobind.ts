//Method Decorator
export function autobind(_: any, _2: string, descriptor: PropertyDescriptor) { // _ dont use but you accept them
    const originalMethod = descriptor.value; //name of method
    const adjDescriptor: PropertyDescriptor = {
        configurable: true,
        get() {
            const boundFn = originalMethod.bind(this);
            return boundFn;
        }
    };
    return adjDescriptor;
}