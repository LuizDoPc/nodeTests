module.exports = toolbox => {
    const { filesystem, template, parameters, print: { success, error } } = toolbox;

    async function isReactNative(){
        const package = await filesystem.read('package.json', 'json');
        const isReactNative = !!package.dependencies['react-native'];
    }

    async function createComponent(folder, name){
        if(!parameters.first){
            error('Name must be specified');
            return;
        }

        await template.generate({
            template: 'component.js.ejs',
            target: `${folder}/${name}/index.js`,
            props: {name}
        });

        const styleTemplate = ( await isReactNative() ) 
            ? 'styles-rn.js.ejs' 
            : 'styles-react.js.ejs';

        await template.generate({
            template: styleTemplate,
            target: `${folder}/${name}/styles.js`
        });

        success(`Generated ${folder}/${name}`);
    }

    toolbox.createComponent = createComponent
}