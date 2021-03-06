import "./terminal-tab.scss"

import React from "react"
import { observer } from "mobx-react";
import { Trans } from "@lingui/macro";
import { autobind, cssNames } from "../../utils";
import { DockTab, DockTabProps } from "./dock-tab";
import { Icon } from "../icon";
import { terminalStore } from "./terminal.store";

interface Props extends DockTabProps {
}

@observer
export class TerminalTab extends React.Component<Props> {
  get tabId() {
    return this.props.value.id;
  }

  get isDisconnected() {
    return terminalStore.isDisconnected(this.tabId);
  }

  @autobind()
  reconnect() {
    terminalStore.reconnect(this.tabId);
  }

  render() {
    const tabIcon = <Icon material="keyboard"/>;
    const className = cssNames("TerminalTab", this.props.className, {
      disconnected: this.isDisconnected,
    });
    return (
      <DockTab
        {...this.props}
        className={className}
        icon={tabIcon}
        moreActions={this.isDisconnected && (
          <Icon
            small
            material="refresh"
            className="restart-icon"
            tooltip={<Trans>Restart session</Trans>}
            onClick={this.reconnect}
          />
        )}
      />
    )
  }
}