function newWebApp() {

    let thisObject = {
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function finalize() {

    }

    async function initialize() {
        try {
            setupRootObject(UI, 'UI')
            setupRootObject(SA, 'SA')
            await UI.projects.socialTrading.modules.webSocketsClient.initialize()
            setupHomePage()
            setupEventHandlers()
        } catch (err) {
            console.log('[ERROR] initialize -> err.stack = ' + err.stack)
        }
    }

    function setupRootObject(rootObject, rootObjectName) {
        /*
        Here we will setup the UI object, with all the
        projects and spaces.
        */
        for (let i = 0; i < UI.schemas.projectSchema.length; i++) {
            let projectDefinition = UI.schemas.projectSchema[i]
            rootObject.projects[projectDefinition.propertyName] = {}
            let projectInstance = rootObject.projects[projectDefinition.propertyName]

            projectInstance.utilities = {}
            projectInstance.globals = {}
            projectInstance.functionLibraries = {}
            projectInstance.modules = {}

            if (projectDefinition[rootObjectName] === undefined) { continue }

            /* Set up Globals of this Project */
            if (projectDefinition[rootObjectName].globals !== undefined) {
                for (let j = 0; j < projectDefinition[rootObjectName].globals.length; j++) {
                    let globalDefinition = projectDefinition[rootObjectName].globals[j]

                    if (exports[globalDefinition.functionName] === undefined) {
                        projectInstance.globals[globalDefinition.propertyName] = eval(globalDefinition.functionName + '()')
                    } else {
                        projectInstance.globals[globalDefinition.propertyName] = eval('exports.' + globalDefinition.functionName + '()')
                    }
                }
            }

            /* Set up Utilities of this Project */
            if (projectDefinition[rootObjectName].utilities !== undefined) {
                for (let j = 0; j < projectDefinition[rootObjectName].utilities.length; j++) {
                    let utilityDefinition = projectDefinition[rootObjectName].utilities[j]

                    if (exports[utilityDefinition.functionName] === undefined) {
                        projectInstance.utilities[utilityDefinition.propertyName] = eval(utilityDefinition.functionName + '()')
                    } else {
                        projectInstance.utilities[utilityDefinition.propertyName] = eval('exports.' + utilityDefinition.functionName + '()')
                    }
                }
            }

            /* Set up Function Libraries of this Project */
            if (projectDefinition[rootObjectName].functionLibraries !== undefined) {
                for (let j = 0; j < projectDefinition[rootObjectName].functionLibraries.length; j++) {
                    let functionLibraryDefinition = projectDefinition[rootObjectName].functionLibraries[j]

                    if (exports[functionLibraryDefinition.functionName] === undefined) {
                        projectInstance.functionLibraries[functionLibraryDefinition.propertyName] = eval(functionLibraryDefinition.functionName + '()')
                    } else {
                        projectInstance.functionLibraries[functionLibraryDefinition.propertyName] = eval('exports.' + functionLibraryDefinition.functionName + '()')
                    }
                }
            }

            /* Set up Modules of this Project */
            if (projectDefinition[rootObjectName].modules !== undefined) {
                for (let j = 0; j < projectDefinition[rootObjectName].modules.length; j++) {
                    let functionLibraryDefinition = projectDefinition[rootObjectName].modules[j]

                    if (exports[functionLibraryDefinition.functionName] === undefined) {
                        projectInstance.modules[functionLibraryDefinition.propertyName] = eval(functionLibraryDefinition.functionName + '()')
                    } else {
                        projectInstance.modules[functionLibraryDefinition.propertyName] = eval('exports.' + functionLibraryDefinition.functionName + '()')
                    }
                }
            }
        }
    }

    async function setupHomePage() {
        let queryMessage
        let query
        /*
        Test Query User Profiles.
        */
        queryMessage = {
            queryType: SA.projects.socialTrading.globals.queryTypes.UNFOLLOWED_USER_PROFILES,
            emitterUserProfileId: undefined,
            initialIndex: SA.projects.socialTrading.globals.queryConstants.INITIAL_INDEX_FIRST,
            amountRequested: 3,
            direction: SA.projects.socialTrading.globals.queryConstants.DIRECTION_UP
        }

        query = {
            requestType: 'Query',
            queryMessage: JSON.stringify(queryMessage)
        }

        await UI.projects.socialTrading.modules.webSocketsClient.sendMessage(
            JSON.stringify(query)
        )
            .then(showProfiles)
            .catch(onError)

        async function showProfiles(profiles) {
            console.log(profiles)
            document.getElementById('context-cell')

            addWhoToFollowTable(profiles)
        }

        /*
        Error Handling
        */
        function onError(errorMessage) {
            console.log('[ERROR] Query not executed. ' + errorMessage)
            console.log('[ERROR] query = ' + JSON.stringify(query))
        }
    }

    function setupEventHandlers() {
        /*
        Add events to process button clicks , and mouseWheel.
        */
        document.addEventListener("click", onClick)
        document.addEventListener('mousewheel', onMouseWheel, false)

        async function onClick(event) {

            if (event.target && event.target.nodeName === "BUTTON") {
                switch (event.target.action) {
                    case 'Follow Profile': {
                        await sendUserTargetProfileEvent(
                            event.target.userProfileId,
                            SA.projects.socialTrading.globals.eventTypes.FOLLOW_USER_PROFILE
                            )
                            .then(updateButton)
                            .catch(onError)

                        function updateButton() {
                            let span = document.getElementById('profile-to-follow-span-' + event.target.userProfileId)
                            let button = document.getElementById('profile-to-follow-button-' + event.target.userProfileId)
                            span.setAttribute("class", "profile-to-unfollow-span")
                            button.setAttribute("class", "profile-to-unfollow-button")
                            button.action = 'Unfollow Profile'
                        }
                        break
                    }
                    case 'Unfollow Profile': {
                        await sendUserTargetProfileEvent(
                            event.target.userProfileId,
                            SA.projects.socialTrading.globals.eventTypes.UNFOLLOW_USER_PROFILE
                            )
                            .then(updateButton)
                            .catch(onError)

                        function updateButton() {
                            let span = document.getElementById('profile-to-follow-span-' + event.target.userProfileId)
                            let button = document.getElementById('profile-to-follow-button-' + event.target.userProfileId)
                            span.setAttribute("class", "profile-to-follow-span")
                            button.setAttribute("class", "profile-to-follow-button")
                            button.action = 'Follow Profile'
                        }
                        break
                    }
                }
            }

            /*
            Error Handling
            */
            function onError(errorMessage) {
                console.log('[ERROR] Click event failed. ' + errorMessage)
            }
        }

        function onMouseWheel(event) {
            let scrollDiv = document.getElementById("scroll-div")
            scrollDiv.scrollTop = scrollDiv.scrollTop + event.deltaY
        }
    }

    function addWhoToFollowTable(profiles) {

        let contextCell = document.getElementById('who-to-follow-cell')
        let table = document.createElement("table")
        let tblBody = document.createElement("tbody")

        for (let i = 0; i < profiles.length; i++) {
            let profile = profiles[i]
            let row = document.createElement("tr")

            let cell = document.createElement("td")
            addProfileToFollowTable(cell, profile)
            row.appendChild(cell)

            tblBody.appendChild(row)
        }

        table.appendChild(tblBody)
        contextCell.appendChild(table)
        table.setAttribute("class", "who-to-follow-table")
    }

    function addProfileToFollowTable(htmlElement, profile) {
        let table = document.createElement("table")
        let tblBody = document.createElement("tbody")

        let row = document.createElement("tr")

        {
            let cell = document.createElement("td")
            let cellText = document.createTextNode('Profile Picture')
            cell.appendChild(cellText)
            row.appendChild(cell)
        }
        {
            let cell = document.createElement("td")
            let cellText = document.createTextNode(profile.userProfileHandle)
            cell.appendChild(cellText)
            row.appendChild(cell)
        }
        {
            let cell = document.createElement("td")
            let span = document.createElement("span")
            let button = document.createElement("button")
            let text = document.createTextNode('Follow')

            span.setAttribute("id", "profile-to-follow-span-" + profile.userProfileId)
            button.setAttribute("id", "profile-to-follow-button-" + profile.userProfileId)
            button.action = 'Follow Profile'
            button.userProfileId = profile.userProfileId

            span.setAttribute("class", "profile-to-follow-span")
            button.setAttribute("class", "profile-to-follow-button")

            button.appendChild(text)
            span.appendChild(button)
            cell.appendChild(span)
            row.appendChild(cell)
        }

        tblBody.appendChild(row)

        table.appendChild(tblBody)
        htmlElement.appendChild(table)
        table.setAttribute("class", "profile-to-follow-table")
    }

    async function sendUserTargetProfileEvent(
        userProfileId,
        eventType 
        ) {

        return new Promise((resolve, reject) => { asyncCall(resolve, reject) })

        async function asyncCall(resolve, reject) {
            let eventMessage
            let event
            /*
            Test Query User Profiles.
            */
            eventMessage = {
                eventType: eventType,
                eventId: SA.projects.foundations.utilities.miscellaneousFunctions.genereteUniqueId(),
                targetUserProfileId: userProfileId
            }

            event = {
                requestType: 'Event',
                eventMessage: JSON.stringify(eventMessage)
            }

            await UI.projects.socialTrading.modules.webSocketsClient.sendMessage(
                JSON.stringify(event)
            )
                .then(resolve)
                .catch(onError)

            function onError(errorMessage) {
                console.log('[ERROR] Event not executed. ' + errorMessage)
                console.log('[ERROR] event = ' + JSON.stringify(event))
                reject(errorMessage)
            }
        }
    }
}
