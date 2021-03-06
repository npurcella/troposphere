import React from "react";

import IdentityResourcesWrapper from "./detail/resources/IdentityResourcesWrapper";
import InstanceDetailsView from "./resources/instance/details/InstanceDetailsView";

import stores from "stores";

export default React.createClass({
    displayName: "InstanceDetailsPage",

    componentDidMount() {
        stores.IdentityStore.addChangeListener(this.updateState);
        stores.InstanceStore.addChangeListener(this.updateState);
        stores.HelpLinkStore.addChangeListener(this.updateState);
        stores.AllocationSourceStore.addChangeListener(this.updateState);
    },

    componentWillUnmount() {
        stores.IdentityStore.removeChangeListener(this.updateState);
        stores.InstanceStore.removeChangeListener(this.updateState);
        stores.HelpLinkStore.removeChangeListener(this.updateState);
        stores.AllocationSourceStore.removeChangeListener(this.updateState);
    },

    updateState() {
        this.forceUpdate();
    },

    render() {
        let {identityId, instanceId} = this.props.params;
        let identity = stores.IdentityStore.get(identityId);
        let instance = stores.InstanceStore.get(instanceId);
        let helpLinks = stores.HelpLinkStore.getAll();
        let allocationSources = stores.AllocationSourceStore.getAll();

        let requires = [identity, instance, helpLinks, allocationSources];

        // Use truthy check to see if loaded
        let loaded = requires.every(r => Boolean(r));
        if (!loaded) {
            return <div className="loading" />;
        }

        let props = {
            identity,
            instance,
            helpLinks,
            allocationSources
        };

        return (
            <IdentityResourcesWrapper {...props}>
                <InstanceDetailsView {...props} />
            </IdentityResourcesWrapper>
        );
    }
});
