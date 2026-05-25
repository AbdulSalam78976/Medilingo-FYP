// Canvas content — composes all Medlingo artboards.

const W_DESK = 1280;
const H_DESK = 900;
const H_BRAND = 580;

function CanvasContent() {
  return (
    <DesignCanvas>
      <DCSection id="brand" title="Brand foundations" subtitle="Logo, palette, type. Single canvas across all screens.">
        <DCArtboard id="brand-strip" label="Identity · v1" width={W_DESK} height={H_BRAND}>
          <BrandStrip />
        </DCArtboard>
      </DCSection>

      <DCSection id="landing" title="Landing page" subtitle="Two directions: editorial vs. product-forward.">
        <DCArtboard id="landing-a" label="A · Editorial" width={W_DESK} height={H_DESK}>
          <LandingA />
        </DCArtboard>
        <DCArtboard id="landing-b" label="B · Product-forward" width={W_DESK} height={H_DESK}>
          <LandingB />
        </DCArtboard>
      </DCSection>

      <DCSection id="dashboard" title="Dashboard" subtitle="Sidebar workspace vs. top-nav launcher.">
        <DCArtboard id="dashboard-a" label="A · Sidebar workspace" width={W_DESK} height={H_DESK}>
          <DashboardA />
        </DCArtboard>
        <DCArtboard id="dashboard-b" label="B · Top-nav launcher" width={W_DESK} height={H_DESK}>
          <DashboardB />
        </DCArtboard>
      </DCSection>

      <DCSection id="query" title="Query input" subtitle="Focused single-stage vs. composer with context rail.">
        <DCArtboard id="query-a" label="A · Stage, listening" width={W_DESK} height={H_DESK}>
          <QueryA />
        </DCArtboard>
        <DCArtboard id="query-b" label="B · Composer + rail" width={W_DESK} height={H_DESK}>
          <QueryB />
        </DCArtboard>
      </DCSection>

      <DCSection id="response" title="Response display" subtitle="Long-form document vs. conversational thread.">
        <DCArtboard id="response-a" label="A · Document" width={W_DESK} height={H_DESK}>
          <ResponseA />
        </DCArtboard>
        <DCArtboard id="response-b" label="B · Conversation (اردو)" width={W_DESK} height={H_DESK}>
          <ResponseB />
        </DCArtboard>
      </DCSection>

      <DCSection id="history" title="Chat history" subtitle="Timeline + preview pane vs. filterable card grid.">
        <DCArtboard id="history-a" label="A · Timeline + preview" width={W_DESK} height={H_DESK}>
          <HistoryA />
        </DCArtboard>
        <DCArtboard id="history-b" label="B · Filterable grid" width={W_DESK} height={H_DESK}>
          <HistoryB />
        </DCArtboard>
      </DCSection>

      <DCSection id="settings" title="Settings" subtitle="Two-pane control panel vs. single-scroll conversational.">
        <DCArtboard id="settings-a" label="A · Two-pane (Languages)" width={W_DESK} height={H_DESK}>
          <SettingsA />
        </DCArtboard>
        <DCArtboard id="settings-b" label="B · Single scroll" width={W_DESK} height={H_DESK}>
          <SettingsB />
        </DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<CanvasContent />);
