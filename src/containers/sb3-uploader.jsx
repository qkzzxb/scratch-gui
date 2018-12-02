import bindAll from 'lodash.bindall';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import {projectTitleInitialState} from '../reducers/project-title';

/**
 * Project saver component passes a downloadProject function to its child.
 * It expects this child to be a function with the signature
 *     function (downloadProject, props) {}
 * The component can then be used to attach project saving functionality
 * to any other component:
 *
 * <SB3Uploader>{(downloadProject, props) => (
 *     <MyCoolComponent
 *         onClick={downloadProject}
 *         {...props}
 *     />
 * )}</SB3Uploader>
 */
class SB3Uploader extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'downloadProject'
        ]);
    }
    componentDidMount() {
        window.downloadProject = this.downloadProject;
    }

    _getProjectCover() { //获取封面
        return new Promise((resolve, reject) => {
            const { renderer } = this.props;
            const { canvas } = renderer;
            renderer.draw();
            canvas.toBlob(blob => {
                resolve(blob);
            });
        })
    }

    _getProjectSb3() {//获取sb3
        return new Promise((resolve, reject) => {
            const { saveProjectSb3 } = this.props;
            saveProjectSb3()
            .then(blob => {
                resolve(blob);
            });
        })
    }

    downloadProject () {
        console.log(this.props.vm);
        // this.props.vm.deserializeProject('https://steam.nosdn.127.net/3c19f506-f8f6-40f8-8a4b-68952bbdf383.sb3');
        return
        Promise.all([
            this._getProjectSb3(),
            this._getProjectCover()
        ])
        .then(res => {
            console.log('downloadProject', res)
        })
    }
    render () {
        const {
            children
        } = this.props;
        return children(
            this.props.className,
            this.downloadProject
        );
    }
}

const getProjectFilename = (curTitle, defaultTitle) => {
    let filenameTitle = curTitle;
    if (!filenameTitle || filenameTitle.length === 0) {
        filenameTitle = defaultTitle;
    }
    return `${filenameTitle.substring(0, 100)}.sb3`;
};

SB3Uploader.propTypes = {
    children: PropTypes.func,
    className: PropTypes.string,
    onSaveFinished: PropTypes.func,
    projectFilename: PropTypes.string,
    saveProjectSb3: PropTypes.func
};
SB3Uploader.defaultProps = {
    className: ''
};

const mapStateToProps = state => ({
    saveProjectSb3: state.scratchGui.vm.saveProjectSb3.bind(state.scratchGui.vm),
    // loadProject: state.scratchGui.vm.loadProject.bind(state.scratchGui.vm),
    projectFilename: getProjectFilename(state.scratchGui.projectTitle, projectTitleInitialState),
    renderer: state.scratchGui.vm.renderer,
    vm: state.scratchGui.vm
});

export default connect(
    mapStateToProps,
    () => ({}) // omit dispatch prop
)(SB3Uploader);
