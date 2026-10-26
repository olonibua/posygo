import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { type Column, DataTable } from "./data-table";
import { Field, Input } from "./form-controls";
import { FilterTabs } from "./navigation-controls";
import { StatTile } from "./stat-tile";

interface Row {
  id: string;
  name: string;
}

const columns: Column<Row>[] = [{ key: "name", header: "Name", render: (row) => row.name }];

describe("DataTable", () => {
  it("renders rows under an accessible caption", () => {
    render(<DataTable caption="Countries" columns={columns} rows={[{ id: "1", name: "Ghana" }]} rowKey={(row) => row.id} />);
    expect(screen.getByRole("table", { name: "Countries" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Name" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "Ghana" })).toBeInTheDocument();
  });

  it("shows the empty state when there are no rows", () => {
    render(<DataTable caption="Countries" columns={columns} rows={[]} rowKey={(row) => row.id} empty="Nothing yet" />);
    expect(screen.getByText("Nothing yet")).toBeInTheDocument();
  });

  it("renders untrusted text as text, never as markup", () => {
    const hostile = "<img src=x onerror=alert(1)>";
    const { container } = render(<DataTable caption="Rows" columns={columns} rows={[{ id: "1", name: hostile }]} rowKey={(row) => row.id} />);
    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByText(hostile)).toBeInTheDocument();
  });
});

describe("FilterTabs", () => {
  it("marks the active option and reports changes", async () => {
    const onChange = vi.fn();
    render(
      <FilterTabs
        label="Status"
        value="ALL"
        onChange={onChange}
        options={[
          { value: "ALL", label: "All", count: 3 },
          { value: "LIVE", label: "Live", count: 1 },
        ]}
      />,
    );
    expect(screen.getByRole("button", { name: /All/ })).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(screen.getByRole("button", { name: /Live/ }));
    expect(onChange).toHaveBeenCalledWith("LIVE");
  });
});

describe("Field", () => {
  it("links the label, hint and error to the control", () => {
    render(
      <Field label="Email" error="Enter a valid email address">
        {({ id, describedBy, invalid }) => <Input id={id} aria-describedby={describedBy} aria-invalid={invalid} />}
      </Field>,
    );
    const input = screen.getByLabelText("Email");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("Enter a valid email address");
  });
});

describe("StatTile", () => {
  it("shows its label, value and note", () => {
    render(<StatTile tone="sky" label="Awaiting receipt" value={3} note="Expected this week" />);
    expect(screen.getByText("Awaiting receipt")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("Expected this week")).toBeInTheDocument();
  });
});
