import "./pod-menu.scss";

import * as React from "react";
import { t, Trans } from "@lingui/macro";
import { MenuItem, SubMenu } from "../menu";
import { IPodContainer, Pod, nodesApi, podsApi } from "../../api/endpoints";
import { Icon } from "../icon";
import { StatusBrick } from "../status-brick";
import { PodLogsDialog } from "./pod-logs-dialog";
import {
  KubeObjectMenu,
  KubeObjectMenuProps,
} from "../kube-object/kube-object-menu";
import { cssNames, prevDefault } from "../../utils";
import { terminalStore } from "../dock/terminal.store";
import { _i18n } from "../../i18n";
import { hideDetails } from "../../navigation";

interface Props extends KubeObjectMenuProps<Pod> {}

const commonShell: string = "common";
const debugShell: string = "debug";
export class PodMenu extends React.Component<Props> {
  async execShell(container?: string, shellType?: string) {
    hideDetails();
    const { object: pod } = this.props;
    const namespace = pod.getNs();
    const podName = pod.getName();

    if (namespace && podName && container) {
      await terminalStore.startTerminal(
        namespace,
        podName,
        container,
        shellType,
        {
          newTab: true,
        }
      );
    }
  }

  showLogs(container: IPodContainer) {
    PodLogsDialog.open(this.props.object, container);
  }

  renderShellMenu() {
    const { object: pod, toolbar } = this.props;
    const containers = pod.getRunningContainers();
    if (!containers.length) return;
    return (
      <MenuItem
        onClick={prevDefault(() =>
          this.execShell(containers[0].name, commonShell)
        )}
      >
        <Icon svg="ssh" interactive={toolbar} title={_i18n._(t`Pod shell`)} />
        <span className="title">
          <Trans>Shell</Trans>
        </span>
        {containers.length > 1 && (
          <>
            <Icon className="arrow" material="keyboard_arrow_right" />
            <SubMenu>
              {containers.map((container) => {
                const { name } = container;
                return (
                  <MenuItem
                    key={name}
                    onClick={prevDefault(() =>
                      this.execShell(name, commonShell)
                    )}
                    className="flex align-center"
                  >
                    <StatusBrick />
                    {name}
                  </MenuItem>
                );
              })}
            </SubMenu>
          </>
        )}
      </MenuItem>
    );
  }

  renderDebugShellMenu() {
    const { object: pod, toolbar } = this.props;
    const containers = pod.getRunningContainers();
    if (!containers.length) return;
    return (
      <MenuItem
        onClick={prevDefault(() =>
          this.execShell(containers[0].name, debugShell)
        )}
      >
        <Icon
          material="settings"
          interactive={toolbar}
          title={_i18n._(t`Pod Debug shell`)}
        />
        <span className="title">
          <Trans>Debug Shell</Trans>
        </span>
        {containers.length > 1 && (
          <>
            <Icon className="arrow" material="keyboard_arrow_right" />
            <SubMenu>
              {containers.map((container) => {
                const { name } = container;
                return (
                  <MenuItem
                    key={name}
                    onClick={prevDefault(() =>
                      this.execShell(name, debugShell)
                    )}
                    className="flex align-center"
                  >
                    <StatusBrick />
                    {name}
                  </MenuItem>
                );
              })}
            </SubMenu>
          </>
        )}
      </MenuItem>
    );
  }

  renderLogsMenu() {
    const { object: pod, toolbar } = this.props;
    const containers = pod.getAllContainers();
    const statuses = pod.getContainerStatuses();
    if (!containers.length) return;
    return (
      <MenuItem onClick={prevDefault(() => this.showLogs(containers[0]))}>
        <Icon
          material="subject"
          title={_i18n._(t`Logs`)}
          interactive={toolbar}
        />
        <span className="title">
          <Trans>Logs</Trans>
        </span>
        {containers.length > 1 && (
          <>
            <Icon className="arrow" material="keyboard_arrow_right" />
            <SubMenu>
              {containers.map((container) => {
                const { name } = container;
                const status = statuses.find((status) => status.name === name);
                const brick = status ? (
                  <StatusBrick
                    className={cssNames(Object.keys(status.state)[0], {
                      ready: status.ready,
                    })}
                  />
                ) : null;
                return (
                  <MenuItem
                    key={name}
                    onClick={prevDefault(() => this.showLogs(container))}
                    className="flex align-center"
                  >
                    {brick}
                    {name}
                  </MenuItem>
                );
              })}
            </SubMenu>
          </>
        )}
      </MenuItem>
    );
  }

  render() {
    const { ...menuProps } = this.props;
    return (
      <KubeObjectMenu {...menuProps} className="PodMenu">
        {this.renderShellMenu()}
        {this.renderDebugShellMenu()}
        {this.renderLogsMenu()}
      </KubeObjectMenu>
    );
  }
}
