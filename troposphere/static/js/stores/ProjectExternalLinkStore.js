import Dispatcher from "dispatchers/Dispatcher";
import BaseStore from "stores/BaseStore";
import ProjectExternalLinkCollection from "collections/ProjectExternalLinkCollection";
import ProjectExternalLinkConstants from "constants/ProjectExternalLinkConstants";
import ExternalLinkCollection from "collections/ExternalLinkCollection";
import ExternalLink from "models/ExternalLink";
import stores from "stores";

let _modelsFor = {};
let _isFetchingFor = {};
let _pendingProjectExternalLinks = new ExternalLinkCollection();

function addPending(model) {
    _pendingProjectExternalLinks.add(model);
}

function removePending(model) {
    _pendingProjectExternalLinks.remove(model);
}

let ProjectStore = BaseStore.extend({
    collection: ProjectExternalLinkCollection,

    initialize: function() {
        this.models = new ProjectExternalLinkCollection();
    },

    fetchModelsFor: function(projectId) {
        // Stop request if no ID
        if (!projectId) {
            return;
        }

        if (!_modelsFor[projectId] && !_isFetchingFor[projectId]) {
            _isFetchingFor[projectId] = true;
            var models = new ProjectExternalLinkCollection();
            models
                .fetch({
                    url: models.url + "?project__id=" + projectId
                })
                .done(
                    function() {
                        _isFetchingFor[projectId] = false;
                        // add models to existing cache
                        this.models.add(models.models);

                        // convert ProjectExternalLink collection to an ExternalLinkCollection
                        var external_links = models.map(function(p_link) {
                            return new ExternalLink(
                                p_link.get("external_link"),
                                {
                                    parse: true
                                }
                            );
                        });
                        external_links = new ExternalLinkCollection(
                            external_links
                        );

                        _modelsFor[projectId] = external_links;
                        this.emitChange();
                    }.bind(this)
                );
        }
    },

    getExternalLinksFor: function(project) {
        var allExternalLinks = stores.ExternalLinkStore.getAll();
        if (!_modelsFor[project.id]) return this.fetchModelsFor(project.id);
        if (!allExternalLinks) return;

        var external_links = this.models
            .filter(function(p_link) {
                // filter out irrelevant project external_links (not in target project)
                return p_link.get("project").id === project.id;
            })
            .filter(function(p_link) {
                // filter out the external_links that don't exist (not in local cache)
                return allExternalLinks.get(p_link.get("external_link").id);
            })
            .map(function(p_link) {
                // return the actual external_links
                return allExternalLinks.get(p_link.get("external_link").id);
            });

        var pendingExternalLinks = _pendingProjectExternalLinks
            .filter(function(p_link) {
                // filter out irrelevant project external_links (not in target project)
                return p_link.get("project").id === project.id;
            })
            .filter(function(p_link) {
                // filter out the external_links that don't exist (not in local cache)
                return allExternalLinks.get(p_link.get("external_link"));
            })
            .map(function(p_link) {
                // return the actual external_links
                return allExternalLinks.get(p_link.get("external_link"));
            });

        return new ExternalLinkCollection(
            external_links.concat(pendingExternalLinks)
        );
    }
});

let store = new ProjectStore();

Dispatcher.register(function(dispatch) {
    var actionType = dispatch.action.actionType;
    var payload = dispatch.action.payload;
    var options = dispatch.action.options || options;

    switch (actionType) {
        case ProjectExternalLinkConstants.ADD_PROJECT_LINK:
            store.add(payload.projectExternalLink);
            break;

        case ProjectExternalLinkConstants.REMOVE_PROJECT_LINK:
            store.remove(payload.projectExternalLink);
            break;

        case ProjectExternalLinkConstants.ADD_PENDING_PROJECT_LINK:
            addPending(payload.projectExternalLink);
            break;

        case ProjectExternalLinkConstants.REMOVE_PENDING_PROJECT_LINK:
            removePending(payload.projectExternalLink);
            break;

        case ProjectExternalLinkConstants.EMIT_CHANGE:
            break;

        default:
            return true;
    }

    if (!options.silent) {
        store.emitChange();
    }

    return true;
});

export default store;
