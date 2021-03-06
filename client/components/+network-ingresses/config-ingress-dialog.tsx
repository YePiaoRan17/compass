import "./config-ingress-dialog.scss"

import React from "react";
import {observer} from "mobx-react";
import {Dialog, DialogProps} from "../dialog";
import {observable} from "mobx";
import {Wizard, WizardStep} from "../wizard";
import {t, Trans} from "@lingui/macro";
import {Notifications} from "../notifications";
import {Collapse} from "../collapse";
import {SubTitle} from "../layout/sub-title";
import {Input} from "../input";
import {Backend, backend, BackendDetails, MultiRuleDetails, Rule, TlsDetails, Tls} from "../+network-ingress-details";
import {Ingress, ingressApi} from "../../api/endpoints";
import {NamespaceSelect} from "../+namespaces/namespace-select";
import {ingressStore} from "./ingress.store";
import { IKubeObjectMetadata } from "client/api/kube-object";

interface Props extends Partial<DialogProps> {
}

@observer
export class ConfigIngressDialog extends React.Component<Props> {

  @observable static isOpen = false;
  @observable static Data: Ingress = null;
  @observable name = "";
  @observable namespace = "";
  @observable tls: Tls[] = [];
  @observable rules: Rule[] = [];
  @observable backend: Backend = backend

  static open(object:Ingress) {
    ConfigIngressDialog.isOpen = true;
    ConfigIngressDialog.Data = object;
  }

  static close() {
    ConfigIngressDialog.isOpen = false;
  }

  close = async () => {
    ConfigIngressDialog.close();
    await this.reset();

  }

  get ingress() {
    return ConfigIngressDialog.Data
  }

  reset = async () => {
    this.name=""
    this.namespace=""
    this.tls=[]
    this.rules=[]
    this.backend.serviceName=""
    this.backend.servicePort=0

  }

  onOpen = async () => {
    this.name = this.ingress.getName()
    this.namespace = this.ingress.getNs()
    this.rules = this.ingress.spec.rules
    this.backend = this.ingress.spec.backend||{serviceName:'',servicePort:0}
  }

  updateIngress = () => {
    const {name, namespace, tls, rules, backend} = this;
    let data: Partial<Ingress> = {
      spec: {
        tls: tls.map(item => {
          return {hosts: item.hosts, secretName: item.secretName};
        }).slice(),
        rules: JSON.parse(JSON.stringify(rules)),
      },
    }
    if (backend && backend.serviceName != "" && backend.servicePort != 0) {
      data.spec.backend = JSON.parse(JSON.stringify(backend))
    }
      ingressStore.update(this.ingress, {...data}).then(res=>{
        Notifications.ok(
          <>Ingress {name} save succeeded</>
        );
        this.close();
      }).catch(err=>{
        Notifications.error(err);
      })

  }

  render() {
    const {...dialogProps} = this.props;
    const header = <h5><Trans>Update Ingress</Trans></h5>;
    return (
      <Dialog
        {...dialogProps}
        className="ConfigIngressDialog"
        isOpen={ConfigIngressDialog.isOpen}
        close={this.close}
        onOpen={this.onOpen}
      >
        <Wizard header={header} done={this.close}>
          <WizardStep contentClass="flow column" nextLabel={<Trans>Apply</Trans>} next={this.updateIngress}>
            <SubTitle title={<Trans>Name</Trans>}/>
            <Input
              required={true}
              disabled={true}
              title={"Name"}
              value={this.name}
              onChange={value => this.name = value}
            />
            <SubTitle title={<Trans>Namespace</Trans>}/>
            <NamespaceSelect
              required={true}
              isDisabled={true}
              themeName="light"
              title={"namespace"}
              value={this.namespace}
              onChange={({value}) => this.namespace = value}
            />
            <Collapse panelName={<Trans>Rules</Trans>} key={"rules"}>
              <MultiRuleDetails
                value={this.rules}
                onChange={value => this.rules = value}/>
            </Collapse>

            {/**********  Please do not delete it. It may be used later ***********/}

            {/* <Collapse panelName={<Trans>Backend</Trans>} key={"backend"}>
              <BackendDetails
                value={this.backend}
                onChange={value => this.backend = value}
              />
            </Collapse>
            <Collapse panelName={<Trans>Transport Layer Security</Trans>} key={"tls"}>
              <TlsDetails
                value={this.tls}
                onChange={value => this.tls = value}
              />
            </Collapse> */}
          </WizardStep>
        </Wizard>
      </Dialog>
    )
  }
}